package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpPlanAdjustmentQuery;
import com.huaweicloud.plm.system.dto.ErpPlanAdjustmentSaveRequest;
import com.huaweicloud.plm.system.entity.ErpPlanAdjustment;
import com.huaweicloud.plm.system.mapper.ErpPlanAdjustmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 需求计划—计划调整（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）：
 * 计划调整登记、分页查询与删除。
 * 计划调整单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpPlanAdjustmentService {

    private static final String DEFAULT_ADJUSTMENT_NO_PREFIX = "EPA";
    private static final String DEFAULT_ADJUSTMENT_TYPE = "DEMAND";
    private static final String DEFAULT_UOM = "PCS";
    private static final String DEFAULT_ADJUSTMENT_STATUS = "DRAFT";

    private final ErpPlanAdjustmentMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询计划调整：状态/类型/物料编码/需求计划号精确，调整单号/物料名称模糊，按主键倒序。 */
    public PageResult<ErpPlanAdjustment> page(ErpPlanAdjustmentQuery query) {
        Page<ErpPlanAdjustment> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpPlanAdjustment>lambdaQuery()
                .eq(StringUtils.hasText(query.getAdjustmentStatus()),
                        ErpPlanAdjustment::getAdjustmentStatus, query.getAdjustmentStatus())
                .eq(StringUtils.hasText(query.getAdjustmentType()),
                        ErpPlanAdjustment::getAdjustmentType, query.getAdjustmentType())
                .eq(StringUtils.hasText(query.getMaterialCode()),
                        ErpPlanAdjustment::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getPlanNo()),
                        ErpPlanAdjustment::getPlanNo, query.getPlanNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpPlanAdjustment::getAdjustmentNo, query.getKeyword()).or()
                        .like(ErpPlanAdjustment::getMaterialName, query.getKeyword()))
                .orderByDesc(ErpPlanAdjustment::getId));
        return PageResult.of(page);
    }

    public ErpPlanAdjustment detail(Long id) {
        return require(id);
    }

    /** 新增或更新计划调整：新增时回填默认类型/单位/状态/数量与组织，调整单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpPlanAdjustmentSaveRequest request) {
        ErpPlanAdjustment entity;
        if (id == null) {
            entity = new ErpPlanAdjustment();
            entity.setAdjustmentNo(StringUtils.hasText(request.getAdjustmentNo())
                    ? request.getAdjustmentNo() : flowSupport.nextBizNo(DEFAULT_ADJUSTMENT_NO_PREFIX));
            entity.setAdjustmentType(StringUtils.hasText(request.getAdjustmentType())
                    ? request.getAdjustmentType() : DEFAULT_ADJUSTMENT_TYPE);
            entity.setUom(StringUtils.hasText(request.getUom())
                    ? request.getUom() : DEFAULT_UOM);
            entity.setAdjustmentStatus(StringUtils.hasText(request.getAdjustmentStatus())
                    ? request.getAdjustmentStatus() : DEFAULT_ADJUSTMENT_STATUS);
            entity.setOldQty(request.getOldQty() != null
                    ? request.getOldQty() : BigDecimal.ZERO);
            entity.setNewQty(request.getNewQty() != null
                    ? request.getNewQty() : BigDecimal.ZERO);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 删除计划调整：物理删除以释放计划调整单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpPlanAdjustment require(Long id) {
        ErpPlanAdjustment entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "计划调整不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpPlanAdjustment entity, ErpPlanAdjustmentSaveRequest request) {
        if (StringUtils.hasText(request.getAdjustmentNo())) {
            entity.setAdjustmentNo(request.getAdjustmentNo());
        }
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getAdjustmentType())) {
            entity.setAdjustmentType(request.getAdjustmentType());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getSpec())) {
            entity.setSpec(request.getSpec());
        }
        if (StringUtils.hasText(request.getUom())) {
            entity.setUom(request.getUom());
        }
        if (request.getOldQty() != null) {
            entity.setOldQty(request.getOldQty());
        }
        if (request.getNewQty() != null) {
            entity.setNewQty(request.getNewQty());
        }
        if (request.getOldDate() != null) {
            entity.setOldDate(request.getOldDate());
        }
        if (request.getNewDate() != null) {
            entity.setNewDate(request.getNewDate());
        }
        if (StringUtils.hasText(request.getAdjustReason())) {
            entity.setAdjustReason(request.getAdjustReason());
        }
        if (StringUtils.hasText(request.getAdjustBy())) {
            entity.setAdjustBy(request.getAdjustBy());
        }
        if (request.getAdjustDate() != null) {
            entity.setAdjustDate(request.getAdjustDate());
        }
        if (StringUtils.hasText(request.getAdjustmentStatus())) {
            entity.setAdjustmentStatus(request.getAdjustmentStatus());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getDescription())) {
            entity.setDescription(request.getDescription());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
