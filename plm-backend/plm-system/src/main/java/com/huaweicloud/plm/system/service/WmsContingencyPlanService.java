package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsPlanApproveRequest;
import com.huaweicloud.plm.system.dto.WmsPlanQuery;
import com.huaweicloud.plm.system.dto.WmsPlanSaveRequest;
import com.huaweicloud.plm.system.entity.WmsContingencyPlan;
import com.huaweicloud.plm.system.mapper.WmsContingencyPlanMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/**
 * 应急预案服务（N7，DEV-084）：替代料/跨仓调拨/供应商加急等预案的编制、审批与执行。
 */
@Service
@RequiredArgsConstructor
public class WmsContingencyPlanService {

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_APPROVED = "APPROVED";
    private static final String STATUS_EXECUTING = "EXECUTING";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private final WmsContingencyPlanMapper wmsContingencyPlanMapper;
    private final WmsSupportService wmsSupportService;

    public PageResult<WmsContingencyPlan> page(WmsPlanQuery query) {
        Page<WmsContingencyPlan> page = query.toPage();
        wmsContingencyPlanMapper.selectPage(page, Wrappers.<WmsContingencyPlan>lambdaQuery()
                .eq(StringUtils.hasText(query.getPlanType()), WmsContingencyPlan::getPlanType, query.getPlanType())
                .eq(StringUtils.hasText(query.getPlanStatus()), WmsContingencyPlan::getPlanStatus, query.getPlanStatus())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsContingencyPlan::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getCaseNo()), WmsContingencyPlan::getCaseNo, query.getCaseNo())
                .eq(StringUtils.hasText(query.getSupplierCode()), WmsContingencyPlan::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsContingencyPlan::getPlanNo, query.getKeyword()).or()
                        .like(WmsContingencyPlan::getMaterialCode, query.getKeyword()))
                .orderByDesc(WmsContingencyPlan::getId));
        return PageResult.of(page);
    }

    public WmsContingencyPlan requirePlan(String planNo) {
        WmsContingencyPlan plan = wmsContingencyPlanMapper.selectOne(Wrappers.<WmsContingencyPlan>lambdaQuery()
                .eq(WmsContingencyPlan::getPlanNo, planNo));
        if (plan == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "应急预案不存在: " + planNo);
        }
        return plan;
    }

    public Long create(WmsPlanSaveRequest request) {
        WmsContingencyPlan plan = new WmsContingencyPlan();
        plan.setPlanNo(wmsSupportService.nextNo("PLAN"));
        applyFields(plan, request);
        wmsContingencyPlanMapper.insert(plan);
        return plan.getId();
    }

    public void update(String planNo, WmsPlanSaveRequest request) {
        WmsContingencyPlan plan = requirePlan(planNo);
        applyFields(plan, request);
        wmsContingencyPlanMapper.updateById(plan);
    }

    public void delete(String planNo) {
        WmsContingencyPlan plan = requirePlan(planNo);
        wmsContingencyPlanMapper.deleteById(plan.getId());
    }

    public void approve(String planNo, WmsPlanApproveRequest request) {
        WmsContingencyPlan plan = requirePlan(planNo);
        if (!STATUS_DRAFT.equals(plan.getPlanStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可审批: " + plan.getPlanStatus());
        }
        plan.setPlanStatus(STATUS_APPROVED);
        plan.setApprover(StringUtils.hasText(request.getApprover())
                ? request.getApprover() : UserContext.getUsername());
        plan.setApprovedAt(LocalDateTime.now());
        if (StringUtils.hasText(request.getRemark())) {
            plan.setRemark(request.getRemark());
        }
        wmsContingencyPlanMapper.updateById(plan);
    }

    /**
     * 执行预案：简化为一次调用即完成执行（EXECUTING -> COMPLETED）。
     */
    public void execute(String planNo) {
        WmsContingencyPlan plan = requirePlan(planNo);
        if (!STATUS_APPROVED.equals(plan.getPlanStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可执行: " + plan.getPlanStatus());
        }
        plan.setPlanStatus(STATUS_EXECUTING);
        plan.setPlanStatus(STATUS_COMPLETED);
        plan.setExecutedAt(LocalDateTime.now());
        wmsContingencyPlanMapper.updateById(plan);
    }

    public void cancel(String planNo) {
        WmsContingencyPlan plan = requirePlan(planNo);
        String status = plan.getPlanStatus();
        if (!STATUS_DRAFT.equals(status) && !STATUS_APPROVED.equals(status) && !STATUS_EXECUTING.equals(status)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可取消: " + status);
        }
        plan.setPlanStatus(STATUS_CANCELLED);
        wmsContingencyPlanMapper.updateById(plan);
    }

    private void applyFields(WmsContingencyPlan plan, WmsPlanSaveRequest request) {
        plan.setCaseNo(request.getCaseNo());
        plan.setWarningNo(request.getWarningNo());
        plan.setMaterialCode(request.getMaterialCode());
        plan.setPlanType(request.getPlanType());
        plan.setSubstituteMaterial(request.getSubstituteMaterial());
        plan.setTargetLocationCode(request.getTargetLocationCode());
        plan.setSupplierCode(request.getSupplierCode());
        plan.setExpectedQty(request.getExpectedQty());
        plan.setExpectedDate(request.getExpectedDate());
        plan.setCostImpact(request.getCostImpact());
        plan.setPlanStatus(StringUtils.hasText(request.getPlanStatus())
                ? request.getPlanStatus() : STATUS_DRAFT);
        plan.setRemark(request.getRemark());
    }
}
