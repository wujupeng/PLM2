package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizEcrRiskReviewSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizEcrRiskReview;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizEcrRiskReviewMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 设计工程变更风险评审流程包（OA-DEV-075）：ECR 风险评审。
 * PLM 为技术变更权威记录，OA 承载审批协同；评审通过后是否转 PLM 为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizEcrRiskReviewService {

    public static final String PROCESS_CODE = "OA_ECR_FLOW";

    public static final String BIZ_TYPE = "BIZ_ECR";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizEcrRiskReviewMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizEcrRiskReview> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizEcrRiskReview> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizEcrRiskReview>lambdaQuery()
                .eq(applicantUserId != null, OaBizEcrRiskReview::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizEcrRiskReview::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizEcrRiskReview::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizEcrRiskReview::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizEcrRiskReview::getChangeType, query.getTypeCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizEcrRiskReview::getEcrNo, query.getKeyword()).or()
                        .like(OaBizEcrRiskReview::getEcrTitle, query.getKeyword()).or()
                        .like(OaBizEcrRiskReview::getMaterialCode, query.getKeyword()))
                .orderByDesc(OaBizEcrRiskReview::getId));
        return PageResult.of(page);
    }

    public OaBizEcrRiskReview detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizEcrRiskReviewSaveRequest request) {
        OaBizEcrRiskReview entity;
        if (id == null) {
            entity = new OaBizEcrRiskReview();
            entity.setEcrNo(flowSupport.nextBizNo("ECR"));
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
        OaBizEcrRiskReview entity = requireEntity(id);
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
        OaBizEcrRiskReview entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 关联 PLM 工程变更号（PLM 为技术变更权威记录）。 */
    @Transactional
    public void linkPlmChange(Long id, String plmChangeNo, String plmChangeStatus) {
        OaBizEcrRiskReview entity = requireEntity(id);
        entity.setPlmChangeNo(plmChangeNo);
        entity.setPlmChangeStatus(plmChangeStatus);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizEcrRiskReview entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizEcrRiskReview requireEntity(Long id) {
        OaBizEcrRiskReview entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "ECR 风险评审单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizEcrRiskReview entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的 ECR 单不可修改");
        }
    }

    private void validate(BizEcrRiskReviewSaveRequest request) {
        if (!StringUtils.hasText(request.getEcrTitle())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更标题不能为空");
        }
        if (!StringUtils.hasText(request.getChangeReason())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更原因不能为空");
        }
    }

    private void apply(OaBizEcrRiskReview entity, BizEcrRiskReviewSaveRequest request) {
        entity.setEcrTitle(request.getEcrTitle());
        entity.setChangeType(StringUtils.hasText(request.getChangeType()) ? request.getChangeType() : "ECR");
        entity.setProductCode(request.getProductCode());
        entity.setProductName(request.getProductName());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setChangeReason(request.getChangeReason());
        entity.setRiskDesc(request.getRiskDesc());
        entity.setImpactAnalysis(request.getImpactAnalysis());
        entity.setCountermeasure(request.getCountermeasure());
        entity.setReviewConclusion(request.getReviewConclusion());
        entity.setPlmChangeNo(request.getPlmChangeNo());
        entity.setPlmChangeStatus(request.getPlmChangeStatus());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizEcrRiskReview entity) {
        return "ECR变更风险评审-" + entity.getEcrTitle() + "-" + entity.getEcrNo();
    }

    private String buildFormJson(OaBizEcrRiskReview entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("ecrNo", entity.getEcrNo());
        data.put("ecrTitle", entity.getEcrTitle());
        data.put("changeType", entity.getChangeType());
        data.put("materialCode", entity.getMaterialCode());
        data.put("changeReason", entity.getChangeReason());
        data.put("riskDesc", entity.getRiskDesc());
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
