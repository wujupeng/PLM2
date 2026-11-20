package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.BomCompareDiff;
import com.huaweicloud.plm.system.dto.BomCompareResponse;
import com.huaweicloud.plm.system.dto.BomDetailResponse;
import com.huaweicloud.plm.system.dto.BomExpandNode;
import com.huaweicloud.plm.system.dto.BomLineSaveRequest;
import com.huaweicloud.plm.system.dto.BomQuery;
import com.huaweicloud.plm.system.dto.BomSaveRequest;
import com.huaweicloud.plm.system.dto.BomWhereUsedItem;
import com.huaweicloud.plm.system.dto.ConvertMbomRequest;
import com.huaweicloud.plm.system.entity.BomHeader;
import com.huaweicloud.plm.system.entity.BomLine;
import com.huaweicloud.plm.system.mapper.BomHeaderMapper;
import com.huaweicloud.plm.system.mapper.BomLineMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * BOM 主数据服务（DEV-026 / DEV-027 / DEV-028 / DEV-030 / DEV-031）。
 */
@Service
@RequiredArgsConstructor
public class BomService {

    private static final String DEFAULT_VERSION = "V1";
    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_RELEASED = "released";
    private static final String BOM_TYPE_EBOM = "EBOM";
    private static final String BOM_TYPE_MBOM = "MBOM";
    private static final List<String> EXPAND_STATUS = List.of("released", "draft");

    private final BomHeaderMapper bomHeaderMapper;
    private final BomLineMapper bomLineMapper;

    public PageResult<BomHeader> page(BomQuery query) {
        Page<BomHeader> page = query.toPage();
        bomHeaderMapper.selectPage(page, Wrappers.<BomHeader>lambdaQuery()
                .eq(StringUtils.hasText(query.getProductCode()), BomHeader::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getBomType()), BomHeader::getBomType, query.getBomType())
                .eq(StringUtils.hasText(query.getStatus()), BomHeader::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(BomHeader::getBomCode, query.getKeyword()).or()
                        .like(BomHeader::getProductCode, query.getKeyword()))
                .orderByDesc(BomHeader::getCreatedAt));
        return PageResult.of(page);
    }

    public BomDetailResponse detail(Long headerId) {
        BomHeader header = requireHeader(headerId);
        BomDetailResponse response = new BomDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(headerId));
        return response;
    }

    @Transactional
    public Long create(BomSaveRequest request) {
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : DEFAULT_VERSION;
        ensureUnique(request.getProductCode(), request.getBomType(), versionNo, -1L);
        BomHeader header = new BomHeader();
        header.setBomCode(buildBomCode(request.getProductCode(), request.getBomType(), versionNo));
        header.setProductId(request.getProductId());
        header.setProductCode(request.getProductCode());
        header.setBomType(request.getBomType());
        header.setVersionNo(versionNo);
        header.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        header.setEffectiveFrom(request.getEffectiveFrom());
        header.setEffectiveTo(request.getEffectiveTo());
        header.setDescription(request.getDescription());
        header.setRemark(request.getRemark());
        bomHeaderMapper.insert(header);
        return header.getId();
    }

    @Transactional
    public void update(Long headerId, BomSaveRequest request) {
        BomHeader header = requireHeader(headerId);
        requireDraft(header);
        if (STATUS_RELEASED.equalsIgnoreCase(request.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "BOM 必须通过发布操作转为已发布状态");
        }
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : header.getVersionNo();
        ensureUnique(request.getProductCode(), request.getBomType(), versionNo, headerId);
        header.setProductId(request.getProductId());
        header.setProductCode(request.getProductCode());
        header.setBomType(request.getBomType());
        header.setVersionNo(versionNo);
        if (StringUtils.hasText(request.getStatus())) {
            header.setStatus(request.getStatus());
        }
        header.setEffectiveFrom(request.getEffectiveFrom());
        header.setEffectiveTo(request.getEffectiveTo());
        header.setDescription(request.getDescription());
        header.setRemark(request.getRemark());
        header.setBomCode(buildBomCode(request.getProductCode(), request.getBomType(), versionNo));
        bomHeaderMapper.updateById(header);
    }

    @Transactional
    public void delete(Long headerId) {
        requireDraft(requireHeader(headerId));
        bomLineMapper.delete(Wrappers.<BomLine>lambdaQuery().eq(BomLine::getHeaderId, headerId));
        bomHeaderMapper.deleteById(headerId);
    }

    @Transactional
    public Long addLine(Long headerId, BomLineSaveRequest request) {
        requireDraft(requireHeader(headerId));
        validateLine(request);
        Integer maxLineNo = bomLineMapper.selectMaxLineNo(headerId);
        BomLine line = new BomLine();
        line.setHeaderId(headerId);
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        applyLine(line, request);
        bomLineMapper.insert(line);
        return line.getId();
    }

    @Transactional
    public void updateLine(Long lineId, BomLineSaveRequest request) {
        BomLine line = requireLine(lineId);
        requireDraft(requireHeader(line.getHeaderId()));
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        bomLineMapper.updateById(line);
    }

    @Transactional
    public void deleteLine(Long lineId) {
        BomLine line = requireLine(lineId);
        requireDraft(requireHeader(line.getHeaderId()));
        bomLineMapper.deleteById(lineId);
    }

    /**
     * 多级 BOM 展开：以该 BOM 头的产品编码为根，逐层展开子件；
     * 子件若存在同产品编码 + BOM 类型的已发布/草稿 BOM 头则继续下钻。
     */
    public List<BomExpandNode> expand(Long headerId, Integer levels) {
        BomHeader header = requireHeader(headerId);
        int maxLevel = levels == null || levels < 1 ? 10 : levels;
        Set<String> visited = new HashSet<>();
        visited.add(header.getProductCode());
        return expandChildren(header, header.getProductCode(), BigDecimal.ONE, 1, maxLevel, visited);
    }

    /** 物料反查：查询所有以该物料为子件的 BOM 行，并带出所属 BOM 头信息。 */
    public List<BomWhereUsedItem> whereUsed(String materialCode) {
        if (!StringUtils.hasText(materialCode)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
        List<BomLine> lines = bomLineMapper.selectList(Wrappers.<BomLine>lambdaQuery()
                .eq(BomLine::getChildMaterialCode, materialCode)
                .orderByAsc(BomLine::getHeaderId)
                .orderByAsc(BomLine::getLineNo));
        if (lines.isEmpty()) {
            return new ArrayList<>();
        }
        Set<Long> headerIds = lines.stream().map(BomLine::getHeaderId).collect(Collectors.toSet());
        Map<Long, BomHeader> headerMap = bomHeaderMapper.selectList(Wrappers.<BomHeader>lambdaQuery()
                        .in(BomHeader::getId, headerIds))
                .stream().collect(Collectors.toMap(BomHeader::getId, h -> h, (a, b) -> a));
        List<BomWhereUsedItem> items = new ArrayList<>();
        for (BomLine line : lines) {
            BomHeader header = headerMap.get(line.getHeaderId());
            if (header == null) {
                continue;
            }
            BomWhereUsedItem item = new BomWhereUsedItem();
            item.setHeaderId(header.getId());
            item.setBomCode(header.getBomCode());
            item.setProductCode(header.getProductCode());
            item.setBomType(header.getBomType());
            item.setVersionNo(header.getVersionNo());
            item.setStatus(header.getStatus());
            item.setParentMaterialCode(line.getParentMaterialCode());
            item.setLineNo(line.getLineNo());
            item.setQty(line.getQty());
            items.add(item);
        }
        return items;
    }

    /** BOM 版本比较：按 父件+子件+位号 作为行键比对新增/删除/修改。 */
    public BomCompareResponse compare(Long headerIdA, Long headerIdB) {
        BomHeader headerA = requireHeader(headerIdA);
        BomHeader headerB = requireHeader(headerIdB);
        List<BomLine> linesA = listLines(headerIdA);
        List<BomLine> linesB = listLines(headerIdB);
        Map<String, BomLine> mapA = keyed(linesA);
        Map<String, BomLine> mapB = keyed(linesB);

        List<BomLine> added = new ArrayList<>();
        for (Map.Entry<String, BomLine> entry : mapB.entrySet()) {
            if (!mapA.containsKey(entry.getKey())) {
                added.add(entry.getValue());
            }
        }
        List<BomLine> removed = new ArrayList<>();
        for (Map.Entry<String, BomLine> entry : mapA.entrySet()) {
            if (!mapB.containsKey(entry.getKey())) {
                removed.add(entry.getValue());
            }
        }
        List<BomCompareDiff> modified = new ArrayList<>();
        for (Map.Entry<String, BomLine> entry : mapA.entrySet()) {
            BomLine lineB = mapB.get(entry.getKey());
            if (lineB == null) {
                continue;
            }
            BomLine lineA = entry.getValue();
            appendDiff(modified, entry.getKey(), "qty", lineA.getQty(), lineB.getQty());
            appendDiff(modified, entry.getKey(), "unit", lineA.getUnit(), lineB.getUnit());
            appendDiff(modified, entry.getKey(), "validFrom", lineA.getValidFrom(), lineB.getValidFrom());
            appendDiff(modified, entry.getKey(), "validTo", lineA.getValidTo(), lineB.getValidTo());
            appendDiff(modified, entry.getKey(), "substituteAllowed",
                    lineA.getSubstituteAllowed(), lineB.getSubstituteAllowed());
        }

        BomCompareResponse response = new BomCompareResponse();
        response.setHeaderA(headerA);
        response.setHeaderB(headerB);
        response.setAdded(added);
        response.setRemoved(removed);
        response.setModified(modified);
        return response;
    }

    /** EBOM 转 MBOM：复制源 BOM 头与全部行，记录来源关系。 */
    @Transactional
    public Long convertToMbom(Long headerId, ConvertMbomRequest request) {
        BomHeader source = requireHeader(headerId);
        if (!BOM_TYPE_EBOM.equalsIgnoreCase(source.getBomType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "仅 EBOM 可转换为 MBOM");
        }
        String versionNo = request != null && StringUtils.hasText(request.getTargetVersionNo())
                ? request.getTargetVersionNo() : source.getVersionNo();
        ensureUnique(source.getProductCode(), BOM_TYPE_MBOM, versionNo, -1L);

        BomHeader target = new BomHeader();
        target.setBomCode(buildBomCode(source.getProductCode(), BOM_TYPE_MBOM, versionNo));
        target.setProductId(source.getProductId());
        target.setProductCode(source.getProductCode());
        target.setBomType(BOM_TYPE_MBOM);
        target.setVersionNo(versionNo);
        target.setStatus(STATUS_DRAFT);
        target.setEffectiveFrom(source.getEffectiveFrom());
        target.setEffectiveTo(source.getEffectiveTo());
        target.setSourceBomId(source.getId());
        target.setDescription(request != null && StringUtils.hasText(request.getDescription())
                ? request.getDescription() : source.getDescription());
        target.setRemark(request == null ? null : request.getRemark());
        bomHeaderMapper.insert(target);

        for (BomLine sourceLine : listLines(headerId)) {
            BomLine copy = new BomLine();
            copy.setHeaderId(target.getId());
            copy.setLineNo(sourceLine.getLineNo());
            copy.setParentMaterialCode(sourceLine.getParentMaterialCode());
            copy.setChildMaterialCode(sourceLine.getChildMaterialCode());
            copy.setChildMaterialName(sourceLine.getChildMaterialName());
            copy.setQty(sourceLine.getQty());
            copy.setUnit(sourceLine.getUnit());
            copy.setItemSeq(sourceLine.getItemSeq());
            copy.setSubstituteAllowed(sourceLine.getSubstituteAllowed());
            copy.setValidFrom(sourceLine.getValidFrom());
            copy.setValidTo(sourceLine.getValidTo());
            copy.setRemark(sourceLine.getRemark());
            bomLineMapper.insert(copy);
        }
        return target.getId();
    }

    private List<BomExpandNode> expandChildren(BomHeader header, String path, BigDecimal parentQuantity, int level,
                                               int maxLevel, Set<String> visited) {
        List<BomExpandNode> nodes = new ArrayList<>();
        if (level > maxLevel) {
            return nodes;
        }
        for (BomLine line : listLines(header.getId())) {
            String childCode = line.getChildMaterialCode();
            if (!StringUtils.hasText(childCode)) {
                continue;
            }
            BomExpandNode node = new BomExpandNode();
            node.setMaterialCode(childCode);
            node.setMaterialName(line.getChildMaterialName());
            BigDecimal requiredQuantity = parentQuantity.multiply(line.getQty());
            node.setQty(requiredQuantity);
            node.setUnit(line.getUnit());
            node.setLevel(level);
            String childPath = path + "/" + childCode;
            node.setPath(childPath);
            node.setChildren(new ArrayList<>());
            if (visited.add(childCode)) {
                BomHeader childHeader = findExpandableHeader(childCode, header.getBomType());
                if (childHeader != null) {
                    node.setChildren(expandChildren(childHeader, childPath, requiredQuantity,
                            level + 1, maxLevel, visited));
                }
                visited.remove(childCode);
            }
            nodes.add(node);
        }
        return nodes;
    }

    private BomHeader findExpandableHeader(String productCode, String bomType) {
        List<BomHeader> candidates = bomHeaderMapper.selectList(Wrappers.<BomHeader>lambdaQuery()
                .eq(BomHeader::getProductCode, productCode)
                .eq(BomHeader::getBomType, bomType)
                .in(BomHeader::getStatus, EXPAND_STATUS)
                .orderByDesc(BomHeader::getId));
        return candidates.isEmpty() ? null : candidates.get(0);
    }

    private Map<String, BomLine> keyed(List<BomLine> lines) {
        Map<String, BomLine> map = new LinkedHashMap<>();
        for (BomLine line : lines) {
            map.putIfAbsent(lineKey(line), line);
        }
        return map;
    }

    private String lineKey(BomLine line) {
        return Objects.toString(line.getParentMaterialCode(), "") + "|"
                + Objects.toString(line.getChildMaterialCode(), "") + "|"
                + Objects.toString(line.getItemSeq(), "");
    }

    private void appendDiff(List<BomCompareDiff> diffs, String lineKey, String field, Object valueA, Object valueB) {
        if (!Objects.equals(valueA, valueB)) {
            BomCompareDiff diff = new BomCompareDiff();
            diff.setLineKey(lineKey);
            diff.setFieldName(field);
            diff.setValueA(valueA == null ? null : String.valueOf(valueA));
            diff.setValueB(valueB == null ? null : String.valueOf(valueB));
            diffs.add(diff);
        }
    }

    private List<BomLine> listLines(Long headerId) {
        return bomLineMapper.selectList(Wrappers.<BomLine>lambdaQuery()
                .eq(BomLine::getHeaderId, headerId)
                .orderByAsc(BomLine::getLineNo));
    }

    private void applyLine(BomLine line, BomLineSaveRequest request) {
        line.setParentMaterialCode(request.getParentMaterialCode());
        line.setChildMaterialCode(request.getChildMaterialCode());
        line.setChildMaterialName(request.getChildMaterialName());
        line.setQty(request.getQty());
        line.setUnit(request.getUnit());
        line.setItemSeq(request.getItemSeq());
        line.setSubstituteAllowed(request.getSubstituteAllowed() == null ? 0 : request.getSubstituteAllowed());
        line.setValidFrom(request.getValidFrom());
        line.setValidTo(request.getValidTo());
        line.setRemark(request.getRemark());
    }

    private void validateLine(BomLineSaveRequest request) {
        if (!StringUtils.hasText(request.getParentMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "父件编码不能为空");
        }
        if (!StringUtils.hasText(request.getChildMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "子件编码不能为空");
        }
        if (!StringUtils.hasText(request.getUnit())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "单位不能为空");
        }
        if (request.getQty() == null || request.getQty().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用量必须大于 0");
        }
    }

    private void ensureUnique(String productCode, String bomType, String versionNo, Long excludeId) {
        if (bomHeaderMapper.countByUnique(productCode, bomType, versionNo, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "已存在相同产品编码 + BOM 类型 + 版本号的 BOM: " + productCode + "/" + bomType + "/" + versionNo);
        }
    }

    private String buildBomCode(String productCode, String bomType, String versionNo) {
        return "BOM-" + productCode + "-" + bomType + "-" + versionNo;
    }

    private BomHeader requireHeader(Long headerId) {
        BomHeader header = bomHeaderMapper.selectById(headerId);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "BOM 不存在: " + headerId);
        }
        return header;
    }

    private void requireDraft(BomHeader header) {
        if (!STATUS_DRAFT.equalsIgnoreCase(header.getStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿 BOM 可编辑；已发布版本请创建新版本");
        }
    }

    private BomLine requireLine(Long lineId) {
        BomLine line = bomLineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "BOM 行不存在: " + lineId);
        }
        return line;
    }
}
