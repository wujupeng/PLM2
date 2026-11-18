package com.huaweicloud.plm.system.listener;

import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.service.OaHrAttExceptionService;
import com.huaweicloud.plm.system.service.OaHrLeaveService;
import com.huaweicloud.plm.system.service.OaHrOvertimeService;
import com.huaweicloud.plm.system.service.OaHrResignationService;
import com.huaweicloud.plm.system.service.OaHrVehicleApplyService;
import com.huaweicloud.plm.system.service.OaHrVisitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 行政人事流程终态监听：流程审批通过 / 驳回 / 撤回后，按业务类型回写对应业务单据状态。
 * 事件由工作流引擎在同一事务内同步发布，回写失败会随流程流转一并回滚，避免状态不一致。
 */
@Component
@RequiredArgsConstructor
public class OaHrFlowOutcomeListener {

    private final OaHrLeaveService leaveService;
    private final OaHrOvertimeService overtimeService;
    private final OaHrResignationService resignationService;
    private final OaHrVisitorService visitorService;
    private final OaHrAttExceptionService attExceptionService;
    private final OaHrVehicleApplyService vehicleApplyService;

    @EventListener
    public void onWorkflowFinished(WorkflowInstanceEvent event) {
        Long bizId = event.businessId();
        String businessType = event.businessType();
        if (bizId == null || businessType == null) {
            return;
        }
        switch (businessType) {
            case OaHrLeaveService.BIZ_TYPE -> leaveService.markFlowStatus(bizId, event.instanceStatus());
            case OaHrOvertimeService.BIZ_TYPE -> overtimeService.markFlowStatus(bizId, event.instanceStatus());
            case OaHrResignationService.BIZ_TYPE -> resignationService.markFlowStatus(bizId, event.instanceStatus());
            case OaHrVisitorService.BIZ_TYPE -> visitorService.markFlowStatus(bizId, event.instanceStatus());
            case OaHrAttExceptionService.BIZ_TYPE -> attExceptionService.markFlowStatus(bizId, event.instanceStatus());
            case OaHrVehicleApplyService.BIZ_TYPE -> vehicleApplyService.markFlowStatus(bizId, event.instanceStatus());
            default -> {
                // 其它业务类型由各自的监听器处理
            }
        }
    }
}
