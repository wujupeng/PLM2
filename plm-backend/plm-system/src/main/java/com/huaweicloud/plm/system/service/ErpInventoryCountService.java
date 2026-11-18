package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpInventoryCountDetailResponse;
import com.huaweicloud.plm.system.dto.ErpInventoryCountLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpInventoryCountQuery;
import com.huaweicloud.plm.system.dto.ErpInventoryCountSaveRequest;
import com.huaweicloud.plm.system.entity.ErpInventoryCount;
import com.huaweicloud.plm.system.entity.ErpInventoryCountLine;
import com.huaweicloud.plm.system.mapper.ErpInventoryCountLineMapper;
import com.huaweicloud.plm.system.mapper.ErpInventoryCountMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.List;

/**
 * ERP 库存核算—库存盘点（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 库存盘点头与明细行的登记、分页查询、明细维护与删除。
 * 删除时先逻辑删除全部明细行，再物理删除库存盘点头以释放盘点单号。
 */
@Service
@RequiredArgsConstructor
public class ErpInventoryCountService {

    private static final String DEFAULT_COUNT_NO_PREFIX = "EIC";
    private static final String DEFAULT_COUNT_TYPE = "FULL";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_COUNT_STATUS = "DRAFT";
    private static final String DEFAULT_LINE_STATUS = "OPEN";

    private final ErpInventoryCountMapper mapper;
    private final ErpInventoryCountLineMapper lineMapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询库存盘点：状态/类型/盘点仓库编码精确，单号/仓库名称模糊，按主键倒序。 */
    public PageResult<ErpInventoryCount> page(ErpInventoryCountQuery query) {
        Page<ErpInventoryCount> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpInventoryCount>lambdaQuery()
                .eq(StringUtils.hasText(query.getCountStatus()),
                        ErpInventoryCount::getCountStatus, query.getCountStatus())
                .eq(StringUtils.hasText(query.getCountType()),
                        ErpInventoryCount::getCountType, query.getCountType())
                .eq(StringUtils.hasText(query.getWarehouseCode()),
                        ErpInventoryCount::getWarehouseCode, query.getWarehouseCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpInventoryCount::getCountNo, query.getKeyword()).or()
                        .like(ErpInventoryCount::getWarehouseName, query.getKeyword()))
                .orderByDesc(ErpInventoryCount::getId));
        return PageResult.of(page);
    }

    /** 库存盘点详情：返回库存盘点头与全部明细行。 */
    public ErpInventoryCountDetailResponse detail(Long id) {
        ErpInventoryCount header = require(id);
        ErpInventoryCountDetailResponse response = new ErpInventoryCountDetailResponse();
        response.setHeader(header);
        response.setLines(listLines(id));
        return response;
    }

    /** 新增库存盘点：回填默认类型/状态/数量与组织，盘点单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long create(ErpInventoryCountSaveRequest request) {
        ErpInventoryCount header = new ErpInventoryCount();
        header.setCountNo(StringUtils.hasText(request.getCountNo())
                ? request.getCountNo() : flowSupport.nextBizNo(DEFAULT_COUNT_NO_PREFIX));
        header.setCountType(StringUtils.hasText(request.getCountType())
                ? request.getCountType() : DEFAULT_COUNT_TYPE);
        header.setTotalDiffQty(request.getTotalDiffQty() != null
                ? request.getTotalDiffQty() : BigDecimal.ZERO);
        header.setCountStatus(StringUtils.hasText(request.getCountStatus())
                ? request.getCountStatus() : DEFAULT_COUNT_STATUS);
        header.setOrgId(currentOrgId());
        applyHeader(header, request);
        mapper.insert(header);
        return header.getId();
    }

    /** 更新库存盘点头：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, ErpInventoryCountSaveRequest request) {
        ErpInventoryCount header = require(id);
        applyHeader(header, request);
        mapper.updateById(header);
    }

    /** 删除库存盘点：先逻辑删除全部明细行，再物理删除库存盘点头以释放盘点单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        lineMapper.delete(Wrappers.<ErpInventoryCountLine>lambdaQuery()
                .eq(ErpInventoryCountLine::getCountId, id));
        mapper.physicalDeleteById(id);
    }

    /** 新增库存盘点行：行号为空时取当前最大行号 +1，回填默认行状态/单位/库位/批次/数量。 */
    @Transactional(rollbackFor = Exception.class)
    public Long addLine(Long headerId, ErpInventoryCountLineSaveRequest request) {
        ErpInventoryCount header = require(headerId);
        validateLine(request);
        Integer maxLineNo = lineMapper.selectMaxLineNo(headerId);

        ErpInventoryCountLine line = new ErpInventoryCountLine();
        line.setCountId(headerId);
        line.setCountNo(header.getCountNo());
        line.setLineNo(request.getLineNo() != null
                ? request.getLineNo()
                : (maxLineNo == null ? 1 : maxLineNo + 1));
        line.setLineStatus(StringUtils.hasText(request.getLineStatus())
                ? request.getLineStatus() : DEFAULT_LINE_STATUS);
        line.setUom(StringUtils.hasText(request.getUom())
                ? request.getUom() : DEFAULT_UOM);
        line.setLocationCode(StringUtils.hasText(request.getLocationCode())
                ? request.getLocationCode() : "");
        line.setBatchNo(StringUtils.hasText(request.getBatchNo())
                ? request.getBatchNo() : "");
        line.setBookQty(request.getBookQty() != null
                ? request.getBookQty() : BigDecimal.ZERO);
        line.setActualQty(request.getActualQty() != null
                ? request.getActualQty() : BigDecimal.ZERO);
        line.setDiffQty(request.getDiffQty() != null
                ? request.getDiffQty() : BigDecimal.ZERO);
        applyLine(line, request);
        lineMapper.insert(line);
        return line.getId();
    }

    /** 更新库存盘点行：仅在请求提供字段时覆盖。 */
    @Transactional(rollbackFor = Exception.class)
    public void updateLine(Long lineId, ErpInventoryCountLineSaveRequest request) {
        ErpInventoryCountLine line = requireLine(lineId);
        validateLine(request);
        if (request.getLineNo() != null) {
            line.setLineNo(request.getLineNo());
        }
        applyLine(line, request);
        lineMapper.updateById(line);
    }

    /** 删除库存盘点行：逻辑删除。 */
    @Transactional(rollbackFor = Exception.class)
    public void deleteLine(Long lineId) {
        requireLine(lineId);
        lineMapper.deleteById(lineId);
    }

    public ErpInventoryCount require(Long id) {
        ErpInventoryCount header = mapper.selectById(id);
        if (header == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存盘点单不存在: " + id);
        }
        return header;
    }

    private ErpInventoryCountLine requireLine(Long lineId) {
        ErpInventoryCountLine line = lineMapper.selectById(lineId);
        if (line == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "库存盘点行不存在: " + lineId);
        }
        return line;
    }

    private List<ErpInventoryCountLine> listLines(Long countId) {
        return lineMapper.selectList(Wrappers.<ErpInventoryCountLine>lambdaQuery()
                .eq(ErpInventoryCountLine::getCountId, countId)
                .orderByAsc(ErpInventoryCountLine::getLineNo));
    }

    private void validateLine(ErpInventoryCountLineSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码不能为空");
        }
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖库存盘点头字段。 */
    private void applyHeader(ErpInventoryCount header, ErpInventoryCountSaveRequest request) {
        if (StringUtils.hasText(request.getCountNo())) {
            header.setCountNo(request.getCountNo());
        }
        if (StringUtils.hasText(request.getCountType())) {
            header.setCountType(request.getCountType());
        }
        if (StringUtils.hasText(request.getWarehouseCode())) {
            header.setWarehouseCode(request.getWarehouseCode());
        }
        if (StringUtils.hasText(request.getWarehouseName())) {
            header.setWarehouseName(request.getWarehouseName());
        }
        if (StringUtils.hasText(request.getCountBy())) {
            header.setCountBy(request.getCountBy());
        }
        if (request.getCountDate() != null) {
            header.setCountDate(request.getCountDate());
        }
        if (request.getTotalDiffQty() != null) {
            header.setTotalDiffQty(request.getTotalDiffQty());
        }
        if (StringUtils.hasText(request.getCountStatus())) {
            header.setCountStatus(request.getCountStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            header.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            header.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            header.setRemark(request.getRemark());
        }
    }

    /** 仅在请求提供值（字符串非空、数值非空）时覆盖库存盘点行字段。 */
    private void applyLine(ErpInventoryCountLine line, ErpInventoryCountLineSaveRequest request) {
        if (StringUtils.hasText(request.getLineStatus())) {
            line.setLineStatus(request.getLineStatus());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            line.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            line.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            line.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            line.setUom(request.getUom());
        }
        if (StringUtils.hasText(request.getLocationCode())) {
            line.setLocationCode(request.getLocationCode());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            line.setBatchNo(request.getBatchNo());
        }
        if (request.getBookQty() != null) {
            line.setBookQty(request.getBookQty());
        }
        if (request.getActualQty() != null) {
            line.setActualQty(request.getActualQty());
        }
        if (request.getDiffQty() != null) {
            line.setDiffQty(request.getDiffQty());
        }
        if (StringUtils.hasText(request.getRemark())) {
            line.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
