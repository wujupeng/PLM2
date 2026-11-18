package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizCustomerCreditSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizCustomerCredit;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizCustomerCreditMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 客户授信流程包（OA-DEV-062）：授信申请草稿、提交审批、撤回与流程终态回写。
 * 授信类型、默认币种、是否需风险评审、额度授权矩阵均为可配置项，审批路径由 OA-N3 工作流引擎承载。
 */
@Service
@RequiredArgsConstructor
public class OaBizCustomerCreditService {

    public static final String PROCESS_CODE = "OA_CREDIT_FLOW";

    public static final String BIZ_TYPE = "BIZ_CREDIT";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizCustomerCreditMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizCustomerCredit> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizCustomerCredit> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizCustomerCredit>lambdaQuery()
                .eq(applicantUserId != null, OaBizCustomerCredit::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizCustomerCredit::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizCustomerCredit::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizCustomerCredit::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizCustomerCredit::getValidFrom,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizCustomerCredit::getValidFrom,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizCustomerCredit::getCreditNo, query.getKeyword()).or()
                        .like(OaBizCustomerCredit::getCustomerName, query.getKeyword()))
                .orderByDesc(OaBizCustomerCredit::getId));
        return PageResult.of(page);
    }

    public OaBizCustomerCredit detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizCustomerCreditSaveRequest request) {
        OaBizCustomerCredit entity;
        if (id == null) {
            entity = new OaBizCustomerCredit();
            entity.setCreditNo(flowSupport.nextBizNo("CR"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaBizCustomerCredit entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizCustomerCredit entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizCustomerCredit entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizCustomerCredit requireEntity(Long id) {
        OaBizCustomerCredit entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "客户授信申请不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizCustomerCredit entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(String flowStatus) {
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的授信申请不可修改");
        }
    }

    private void validate(BizCustomerCreditSaveRequest request) {
        if (!StringUtils.hasText(request.getCustomerName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "客户名称不能为空");
        }
        if (flowSupport.configBoolean("oa.biz.credit.need.risk.review", true)
                && !StringUtils.hasText(request.getRiskLevel())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "按当前配置，客户授信需填写风险等级");
        }
    }

    private void apply(OaBizCustomerCredit entity, BizCustomerCreditSaveRequest request) {
        entity.setCustomerCode(request.getCustomerCode());
        entity.setCustomerName(request.getCustomerName());
        entity.setCreditType(StringUtils.hasText(request.getCreditType()) ? request.getCreditType() : "NEW");
        entity.setApplyAmount(request.getApplyAmount());
        entity.setCreditLimit(request.getCreditLimit());
        entity.setCurrency(StringUtils.hasText(request.getCurrency()) ? request.getCurrency()
                : flowSupport.configString("oa.biz.credit.default.currency", "CNY"));
        entity.setCreditDays(request.getCreditDays());
        entity.setValidFrom(request.getValidFrom());
        entity.setValidTo(request.getValidTo());
        entity.setRiskLevel(request.getRiskLevel());
        entity.setRiskOpinion(request.getRiskOpinion());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizCustomerCredit entity) {
        return "客户授信申请-" + entity.getCustomerName() + "-" + entity.getCreditNo();
    }

    private String buildFormJson(OaBizCustomerCredit entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("creditNo", entity.getCreditNo());
        data.put("customerName", entity.getCustomerName());
        data.put("creditType", entity.getCreditType());
        data.put("applyAmount", entity.getApplyAmount());
        data.put("creditLimit", entity.getCreditLimit());
        data.put("currency", entity.getCurrency());
        data.put("riskLevel", entity.getRiskLevel());
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String currentDisplayName() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.displayName();
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
