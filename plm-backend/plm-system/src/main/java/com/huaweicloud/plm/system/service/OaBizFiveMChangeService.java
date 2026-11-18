package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizFiveMChangeSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizFiveMChange;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizFiveMChangeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 5M 变更追踪流程包（OA-DEV-072）：人机料法环变更，风险/验证证据/关闭条件完整。
 * 是否必须填写验证方案为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizFiveMChangeService {

    public static final String PROCESS_CODE = "OA_FIVE_M_FLOW";

    public static final String BIZ_TYPE = "BIZ_5M";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizFiveMChangeMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizFiveMChange> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizFiveMChange> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizFiveMChange>lambdaQuery()
                .eq(applicantUserId != null, OaBizFiveMChange::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizFiveMChange::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizFiveMChange::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizFiveMChange::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizFiveMChange::getChangeCategory, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizFiveMChange::getEffectiveDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizFiveMChange::getEffectiveDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizFiveMChange::getChangeNo, query.getKeyword()).or()
                        .like(OaBizFiveMChange::getChangeTitle, query.getKeyword()).or()
                        .like(OaBizFiveMChange::getPartCode, query.getKeyword()))
                .orderByDesc(OaBizFiveMChange::getId));
        return PageResult.of(page);
    }

    public OaBizFiveMChange detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizFiveMChangeSaveRequest request) {
        OaBizFiveMChange entity;
        if (id == null) {
            entity = new OaBizFiveMChange();
            entity.setChangeNo(flowSupport.nextBizNo("5M"));
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
        OaBizFiveMChange entity = requireEntity(id);
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
        OaBizFiveMChange entity = requireEntity(id);
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
        OaBizFiveMChange entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizFiveMChange requireEntity(Long id) {
        OaBizFiveMChange entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "5M 变更单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizFiveMChange entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的 5M 变更单不可修改");
        }
    }

    private void validate(BizFiveMChangeSaveRequest request) {
        if (!StringUtils.hasText(request.getChangeCategory())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更类别不能为空");
        }
        if (!StringUtils.hasText(request.getChangeTitle())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更标题不能为空");
        }
        if (flowSupport.configBoolean("oa.biz.five.m.need.verification", true)
                && !StringUtils.hasText(request.getVerificationPlan())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "按当前配置，5M 变更需填写验证方案");
        }
    }

    private void apply(OaBizFiveMChange entity, BizFiveMChangeSaveRequest request) {
        entity.setChangeCategory(request.getChangeCategory());
        entity.setChangeTitle(request.getChangeTitle());
        entity.setProductCode(request.getProductCode());
        entity.setProductName(request.getProductName());
        entity.setPartCode(request.getPartCode());
        entity.setChangeDesc(request.getChangeDesc());
        entity.setRiskAnalysis(request.getRiskAnalysis());
        entity.setRiskLevel(request.getRiskLevel());
        entity.setVerificationPlan(request.getVerificationPlan());
        entity.setVerificationResult(request.getVerificationResult());
        entity.setEffectiveDate(request.getEffectiveDate());
        entity.setCloseCondition(request.getCloseCondition());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizFiveMChange entity) {
        return "5M变更-" + entity.getChangeTitle() + "-" + entity.getChangeNo();
    }

    private String buildFormJson(OaBizFiveMChange entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("changeNo", entity.getChangeNo());
        data.put("changeCategory", entity.getChangeCategory());
        data.put("changeTitle", entity.getChangeTitle());
        data.put("riskLevel", entity.getRiskLevel());
        data.put("verificationPlan", entity.getVerificationPlan());
        data.put("effectiveDate", entity.getEffectiveDate() == null ? null : entity.getEffectiveDate().toString());
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
