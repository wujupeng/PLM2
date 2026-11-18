package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.InspectionItemSaveRequest;
import com.huaweicloud.plm.system.dto.InspectionSpecDetailResponse;
import com.huaweicloud.plm.system.dto.InspectionSpecQuery;
import com.huaweicloud.plm.system.dto.InspectionSpecSaveRequest;
import com.huaweicloud.plm.system.entity.InspectionItem;
import com.huaweicloud.plm.system.entity.InspectionSpec;
import com.huaweicloud.plm.system.mapper.InspectionItemMapper;
import com.huaweicloud.plm.system.mapper.InspectionSpecMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * 检验规范服务（DEV-048）：规范与检验项目维护、发布、按物料/产品反查及自动匹配。
 */
@Service
@RequiredArgsConstructor
public class InspectionSpecService {

    private static final String DEFAULT_VERSION = "V1";
    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_RELEASED = "released";

    /** 默认抽样方案配置项。 */
    private static final String CONFIG_SAMPLING_DEFAULT = "inspection.sampling.default";
    private static final String DEFAULT_SAMPLING_PLAN = "GB/T 2828.1 一般检验水平 II，AQL 1.0";

    /** 检验项目自动匹配规则配置项。 */
    private static final String CONFIG_AUTO_MATCH_RULE = "inspection.auto_match.rule";
    private static final String DEFAULT_AUTO_MATCH_RULE = "按产品/物料+检验类型+版本匹配生效规范";

    private final InspectionSpecMapper inspectionSpecMapper;
    private final InspectionItemMapper inspectionItemMapper;
    private final ConfigService configService;

    public PageResult<InspectionSpec> page(InspectionSpecQuery query) {
        Page<InspectionSpec> page = query.toPage();
        inspectionSpecMapper.selectPage(page, Wrappers.<InspectionSpec>lambdaQuery()
                .eq(StringUtils.hasText(query.getSpecCode()), InspectionSpec::getSpecCode, query.getSpecCode())
                .eq(StringUtils.hasText(query.getInspectionType()),
                        InspectionSpec::getInspectionType, query.getInspectionType())
                .eq(StringUtils.hasText(query.getProductCode()), InspectionSpec::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getMaterialCode()), InspectionSpec::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getStatus()), InspectionSpec::getStatus, query.getStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(InspectionSpec::getSpecCode, query.getKeyword()).or()
                        .like(InspectionSpec::getSpecName, query.getKeyword()))
                .orderByDesc(InspectionSpec::getCreatedAt)
                .orderByDesc(InspectionSpec::getId));
        return PageResult.of(page);
    }

    public InspectionSpecDetailResponse detail(Long specId) {
        InspectionSpec spec = requireSpec(specId);
        InspectionSpecDetailResponse response = new InspectionSpecDetailResponse();
        response.setSpec(spec);
        response.setItems(listItems(specId));
        return response;
    }

    /** 按物料编码反查已发布检验规范。 */
    public List<InspectionSpec> listReleasedByMaterial(String materialCode) {
        return inspectionSpecMapper.selectList(Wrappers.<InspectionSpec>lambdaQuery()
                .eq(InspectionSpec::getMaterialCode, materialCode)
                .eq(InspectionSpec::getStatus, STATUS_RELEASED)
                .orderByDesc(InspectionSpec::getVersionNo)
                .orderByDesc(InspectionSpec::getId));
    }

    /** 按产品编码反查已发布检验规范。 */
    public List<InspectionSpec> listReleasedByProduct(String productCode) {
        return inspectionSpecMapper.selectList(Wrappers.<InspectionSpec>lambdaQuery()
                .eq(InspectionSpec::getProductCode, productCode)
                .eq(InspectionSpec::getStatus, STATUS_RELEASED)
                .orderByDesc(InspectionSpec::getVersionNo)
                .orderByDesc(InspectionSpec::getId));
    }

    /**
     * 自动匹配生效规范：按配置 inspection.auto_match.rule 的口径，匹配 status=released 且检验类型相符、
     * 产品编码或物料编码相符的记录，多条时取 id 最大的一条。
     */
    public InspectionSpec match(String productCode, String materialCode, String inspectionType) {
        String rule = autoMatchRule();
        boolean hasProduct = StringUtils.hasText(productCode);
        boolean hasMaterial = StringUtils.hasText(materialCode);
        if (!hasProduct && !hasMaterial) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "产品编码与物料编码至少填写一个（匹配规则：" + rule + "）");
        }
        List<InspectionSpec> candidates = inspectionSpecMapper.selectList(Wrappers.<InspectionSpec>lambdaQuery()
                .eq(InspectionSpec::getStatus, STATUS_RELEASED)
                .eq(StringUtils.hasText(inspectionType), InspectionSpec::getInspectionType, inspectionType)
                .and(w -> {
                    if (hasProduct && hasMaterial) {
                        w.eq(InspectionSpec::getProductCode, productCode)
                                .or()
                                .eq(InspectionSpec::getMaterialCode, materialCode);
                    } else if (hasProduct) {
                        w.eq(InspectionSpec::getProductCode, productCode);
                    } else {
                        w.eq(InspectionSpec::getMaterialCode, materialCode);
                    }
                })
                .orderByDesc(InspectionSpec::getId));
        return candidates.isEmpty() ? null : candidates.get(0);
    }

    @Transactional
    public Long create(InspectionSpecSaveRequest request) {
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : DEFAULT_VERSION;
        ensureUnique(request.getSpecCode(), versionNo, -1L);
        InspectionSpec spec = new InspectionSpec();
        applySpec(spec, request, versionNo);
        spec.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus() : STATUS_DRAFT);
        resolveSamplingPlan(spec, request);
        inspectionSpecMapper.insert(spec);
        replaceItems(spec.getId(), request.getItems());
        return spec.getId();
    }

    @Transactional
    public void update(Long specId, InspectionSpecSaveRequest request) {
        InspectionSpec spec = requireSpec(specId);
        if (STATUS_RELEASED.equalsIgnoreCase(spec.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的检验规范不允许修改");
        }
        String versionNo = StringUtils.hasText(request.getVersionNo()) ? request.getVersionNo() : spec.getVersionNo();
        ensureUnique(request.getSpecCode(), versionNo, specId);
        applySpec(spec, request, versionNo);
        if (StringUtils.hasText(request.getStatus())) {
            spec.setStatus(request.getStatus());
        }
        resolveSamplingPlan(spec, request);
        inspectionSpecMapper.updateById(spec);
        replaceItems(specId, request.getItems());
    }

    @Transactional
    public void delete(Long specId) {
        InspectionSpec spec = requireSpec(specId);
        if (STATUS_RELEASED.equalsIgnoreCase(spec.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "已发布的检验规范不允许删除");
        }
        inspectionItemMapper.delete(Wrappers.<InspectionItem>lambdaQuery()
                .eq(InspectionItem::getSpecId, specId));
        inspectionSpecMapper.deleteById(specId);
    }

    /** 仅维护检验项目明细：整体替换。 */
    @Transactional
    public void saveItems(Long specId, List<InspectionItemSaveRequest> items) {
        requireSpec(specId);
        replaceItems(specId, items);
    }

    /** 发布：至少 1 个检验项目。 */
    @Transactional
    public void release(Long specId) {
        InspectionSpec spec = requireSpec(specId);
        if (listItems(specId).isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "至少需要 1 个检验项目才能发布");
        }
        spec.setStatus(STATUS_RELEASED);
        inspectionSpecMapper.updateById(spec);
    }

    public List<InspectionItem> listItems(Long specId) {
        return inspectionItemMapper.selectList(Wrappers.<InspectionItem>lambdaQuery()
                .eq(InspectionItem::getSpecId, specId)
                .orderByAsc(InspectionItem::getSeqNo)
                .orderByAsc(InspectionItem::getId));
    }

    private void replaceItems(Long specId, List<InspectionItemSaveRequest> items) {
        inspectionItemMapper.delete(Wrappers.<InspectionItem>lambdaQuery()
                .eq(InspectionItem::getSpecId, specId));
        if (items == null) {
            return;
        }
        int index = 1;
        for (InspectionItemSaveRequest request : items) {
            InspectionItem item = new InspectionItem();
            item.setSpecId(specId);
            item.setSeqNo(request.getSeqNo() == null ? index : request.getSeqNo());
            applyItem(item, request);
            inspectionItemMapper.insert(item);
            index++;
        }
    }

    /** 抽样方案：未填写时按配置 inspection.sampling.default 兜底。 */
    private void resolveSamplingPlan(InspectionSpec spec, InspectionSpecSaveRequest request) {
        if (StringUtils.hasText(request.getSamplingPlan())) {
            spec.setSamplingPlan(request.getSamplingPlan());
        } else {
            String sampling = configService.getValue(CONFIG_SAMPLING_DEFAULT);
            spec.setSamplingPlan(StringUtils.hasText(sampling) ? sampling : DEFAULT_SAMPLING_PLAN);
        }
        spec.setAqlLevel(request.getAqlLevel());
    }

    private String autoMatchRule() {
        String value = configService.getValue(CONFIG_AUTO_MATCH_RULE);
        return StringUtils.hasText(value) ? value : DEFAULT_AUTO_MATCH_RULE;
    }

    private void applySpec(InspectionSpec spec, InspectionSpecSaveRequest request, String versionNo) {
        spec.setSpecCode(request.getSpecCode());
        spec.setSpecName(request.getSpecName());
        spec.setInspectionType(request.getInspectionType());
        spec.setProductCode(request.getProductCode());
        spec.setMaterialCode(request.getMaterialCode());
        spec.setVersionNo(versionNo);
        spec.setEffectiveDate(request.getEffectiveDate());
        spec.setRemark(request.getRemark());
    }

    private void applyItem(InspectionItem item, InspectionItemSaveRequest request) {
        item.setItemCode(request.getItemCode());
        item.setItemName(request.getItemName());
        item.setInspectionMethod(request.getInspectionMethod());
        item.setEquipment(request.getEquipment());
        item.setUnit(request.getUnit());
        item.setStandardValue(request.getStandardValue());
        item.setUpperLimit(request.getUpperLimit());
        item.setLowerLimit(request.getLowerLimit());
        item.setVerdictRule(request.getVerdictRule());
        item.setKeyItem(request.getKeyItem() == null ? 0 : request.getKeyItem());
        item.setRemark(request.getRemark());
    }

    private void ensureUnique(String specCode, String versionNo, Long excludeId) {
        if (inspectionSpecMapper.countByCode(specCode, versionNo, excludeId) > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "已存在相同规范编码 + 版本号的检验规范: " + specCode + "/" + versionNo);
        }
    }

    private InspectionSpec requireSpec(Long specId) {
        InspectionSpec spec = inspectionSpecMapper.selectById(specId);
        if (spec == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "检验规范不存在: " + specId);
        }
        return spec;
    }
}
