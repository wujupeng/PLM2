package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ErpProcessPlanQuery;
import com.huaweicloud.plm.system.dto.ErpProcessPlanSaveRequest;
import com.huaweicloud.plm.system.entity.ErpProcessPlan;
import com.huaweicloud.plm.system.mapper.ErpProcessPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * ERP 工艺资源—工序计划（对应 G3-N7b ERP 工艺资源）：
 * 工序计划登记、分页查询与删除。
 * 计划单号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class ErpProcessPlanService {

    private static final String DEFAULT_PLAN_NO_PREFIX = "PLN";
    private static final String DEFAULT_PLAN_STATUS = "PENDING";

    private final ErpProcessPlanMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询工序计划：计划状态/生产订单号精确，计划单号/生产订单号/物料编码/工序名称模糊，按主键倒序。 */
    public PageResult<ErpProcessPlan> page(ErpProcessPlanQuery query) {
        Page<ErpProcessPlan> page = query.toPage();
        mapper.selectPage(page, Wrappers.<ErpProcessPlan>lambdaQuery()
                .eq(StringUtils.hasText(query.getPlanStatus()),
                        ErpProcessPlan::getPlanStatus, query.getPlanStatus())
                .eq(StringUtils.hasText(query.getProductionOrderNo()),
                        ErpProcessPlan::getProductionOrderNo, query.getProductionOrderNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(ErpProcessPlan::getPlanNo, query.getKeyword()).or()
                        .like(ErpProcessPlan::getProductionOrderNo, query.getKeyword()).or()
                        .like(ErpProcessPlan::getMaterialCode, query.getKeyword()).or()
                        .like(ErpProcessPlan::getOperationName, query.getKeyword()))
                .orderByDesc(ErpProcessPlan::getId));
        return PageResult.of(page);
    }

    public ErpProcessPlan detail(Long id) {
        return require(id);
    }

    /** 新增或更新工序计划：新增时回填默认计划状态/计划数量与组织，计划单号为空时自动生成。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, ErpProcessPlanSaveRequest request) {
        ErpProcessPlan entity;
        if (id == null) {
            entity = new ErpProcessPlan();
            entity.setPlanNo(StringUtils.hasText(request.getPlanNo())
                    ? request.getPlanNo() : flowSupport.nextBizNo(DEFAULT_PLAN_NO_PREFIX));
            entity.setPlanStatus(StringUtils.hasText(request.getPlanStatus())
                    ? request.getPlanStatus() : DEFAULT_PLAN_STATUS);
            entity.setPlanQty(request.getPlanQty() != null
                    ? request.getPlanQty() : BigDecimal.ZERO);
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

    /** 删除工序计划：物理删除以释放计划单号。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    public ErpProcessPlan require(Long id) {
        ErpProcessPlan entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工序计划不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/日期非空）时覆盖实体对应字段。 */
    private void applyRequest(ErpProcessPlan entity, ErpProcessPlanSaveRequest request) {
        if (StringUtils.hasText(request.getPlanNo())) {
            entity.setPlanNo(request.getPlanNo());
        }
        if (StringUtils.hasText(request.getProductionOrderNo())) {
            entity.setProductionOrderNo(request.getProductionOrderNo());
        }
        if (StringUtils.hasText(request.getMaterialCode())) {
            entity.setMaterialCode(request.getMaterialCode());
        }
        if (StringUtils.hasText(request.getMaterialName())) {
            entity.setMaterialName(request.getMaterialName());
        }
        if (StringUtils.hasText(request.getRouteCode())) {
            entity.setRouteCode(request.getRouteCode());
        }
        if (request.getOperationNo() != null) {
            entity.setOperationNo(request.getOperationNo());
        }
        if (StringUtils.hasText(request.getOperationName())) {
            entity.setOperationName(request.getOperationName());
        }
        if (StringUtils.hasText(request.getResourceCode())) {
            entity.setResourceCode(request.getResourceCode());
        }
        if (request.getPlanQty() != null) {
            entity.setPlanQty(request.getPlanQty());
        }
        if (request.getPlannedStartTime() != null) {
            entity.setPlannedStartTime(request.getPlannedStartTime());
        }
        if (request.getPlannedEndTime() != null) {
            entity.setPlannedEndTime(request.getPlannedEndTime());
        }
        if (StringUtils.hasText(request.getPlanStatus())) {
            entity.setPlanStatus(request.getPlanStatus());
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
