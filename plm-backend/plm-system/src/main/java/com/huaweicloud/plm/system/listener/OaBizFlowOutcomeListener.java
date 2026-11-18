package com.huaweicloud.plm.system.listener;

import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.service.OaAssetRepairService;
import com.huaweicloud.plm.system.service.OaBizChangeNoticeService;
import com.huaweicloud.plm.system.service.OaBizCustomerCreditService;
import com.huaweicloud.plm.system.service.OaBizDeliveryCoordinationService;
import com.huaweicloud.plm.system.service.OaBizEcrRiskReviewService;
import com.huaweicloud.plm.system.service.OaBizFiveMChangeService;
import com.huaweicloud.plm.system.service.OaBizInspectionRequestService;
import com.huaweicloud.plm.system.service.OaBizInternalAuditService;
import com.huaweicloud.plm.system.service.OaBizMoldTrialService;
import com.huaweicloud.plm.system.service.OaBizOrderVoucherService;
import com.huaweicloud.plm.system.service.OaBizPriceApprovalService;
import com.huaweicloud.plm.system.service.OaBizSampleIssueService;
import com.huaweicloud.plm.system.service.OaBizSupplierEvaluationService;
import com.huaweicloud.plm.system.service.OaContractService;
import com.huaweicloud.plm.system.service.OaOfficeSupplyService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * 销售采购生产品质研发流程终态监听：流程审批通过 / 驳回 / 撤回后，按业务类型回写对应业务单据状态。
 * 事件由工作流引擎在同一事务内同步发布，回写失败会随流程流转一并回滚，避免状态不一致。
 */
@Component
@RequiredArgsConstructor
public class OaBizFlowOutcomeListener {

    private final OaBizCustomerCreditService customerCreditService;
    private final OaBizPriceApprovalService priceApprovalService;
    private final OaBizDeliveryCoordinationService deliveryCoordinationService;
    private final OaBizOrderVoucherService orderVoucherService;
    private final OaBizSupplierEvaluationService supplierEvaluationService;
    private final OaBizInspectionRequestService inspectionRequestService;
    private final OaBizFiveMChangeService fiveMChangeService;
    private final OaBizSampleIssueService sampleIssueService;
    private final OaBizInternalAuditService internalAuditService;
    private final OaBizEcrRiskReviewService ecrRiskReviewService;
    private final OaBizChangeNoticeService changeNoticeService;
    private final OaBizMoldTrialService moldTrialService;
    private final OaAssetRepairService assetRepairService;
    private final OaContractService contractService;
    private final OaOfficeSupplyService officeSupplyService;

    @EventListener
    public void onWorkflowFinished(WorkflowInstanceEvent event) {
        Long bizId = event.businessId();
        String businessType = event.businessType();
        if (bizId == null || businessType == null) {
            return;
        }
        switch (businessType) {
            case OaBizCustomerCreditService.BIZ_TYPE -> customerCreditService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizPriceApprovalService.BIZ_TYPE -> priceApprovalService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizDeliveryCoordinationService.BIZ_TYPE -> deliveryCoordinationService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizOrderVoucherService.BIZ_TYPE -> orderVoucherService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizSupplierEvaluationService.BIZ_TYPE -> supplierEvaluationService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizInspectionRequestService.BIZ_TYPE -> inspectionRequestService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizFiveMChangeService.BIZ_TYPE -> fiveMChangeService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizSampleIssueService.BIZ_TYPE -> sampleIssueService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizInternalAuditService.BIZ_TYPE -> internalAuditService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizEcrRiskReviewService.BIZ_TYPE -> ecrRiskReviewService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizChangeNoticeService.BIZ_TYPE -> changeNoticeService.markFlowStatus(bizId, event.instanceStatus());
            case OaBizMoldTrialService.BIZ_TYPE -> moldTrialService.markFlowStatus(bizId, event.instanceStatus());
            case OaAssetRepairService.BIZ_TYPE -> assetRepairService.markFlowStatus(bizId, event.instanceStatus());
            case OaContractService.BIZ_TYPE -> contractService.markFlowStatus(bizId, event.instanceStatus());
            case OaOfficeSupplyService.BIZ_TYPE -> officeSupplyService.markFlowStatus(bizId, event.instanceStatus());
            default -> {
                // 其它业务类型由各自的监听器处理
            }
        }
    }
}
