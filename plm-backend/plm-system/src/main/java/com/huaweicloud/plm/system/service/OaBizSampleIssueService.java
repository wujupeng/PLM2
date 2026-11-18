package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizSampleIssueSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizSampleIssue;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizSampleIssueMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 样品试制问题改善流程包（OA-DEV-073）：关联 PLM 产品/BOM/文档，问题闭环可追溯。
 */
@Service
@RequiredArgsConstructor
public class OaBizSampleIssueService {

    public static final String PROCESS_CODE = "OA_SAMPLE_ISSUE_FLOW";

    public static final String BIZ_TYPE = "BIZ_SAMPLE";

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String ISSUE_OPEN = "OPEN";

    private static final String ISSUE_PROCESSING = "PROCESSING";

    private static final String ISSUE_VERIFYING = "VERIFYING";

    private static final String ISSUE_CLOSED = "CLOSED";

    private final OaBizSampleIssueMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizSampleIssue> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizSampleIssue> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizSampleIssue>lambdaQuery()
                .eq(applicantUserId != null, OaBizSampleIssue::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizSampleIssue::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizSampleIssue::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizSampleIssue::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizSampleIssue::getIssueStatus, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizSampleIssue::getDueDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizSampleIssue::getDueDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizSampleIssue::getIssueNo, query.getKeyword()).or()
                        .like(OaBizSampleIssue::getPartCode, query.getKeyword()).or()
                        .like(OaBizSampleIssue::getIssueDesc, query.getKeyword()))
                .orderByDesc(OaBizSampleIssue::getId));
        return PageResult.of(page);
    }

    public OaBizSampleIssue detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizSampleIssueSaveRequest request) {
        OaBizSampleIssue entity;
        if (id == null) {
            entity = new OaBizSampleIssue();
            entity.setIssueNo(flowSupport.nextBizNo("SI"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setIssueStatus(ISSUE_OPEN);
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
        OaBizSampleIssue entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        if (ISSUE_OPEN.equals(entity.getIssueStatus())) {
            entity.setIssueStatus(ISSUE_PROCESSING);
        }
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizSampleIssue entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 关闭问题：填写验证结果并关闭（流程通过后方可关闭）。 */
    @Transactional
    public void close(Long id, String verifyResult) {
        OaBizSampleIssue entity = requireEntity(id);
        if (verifyResult != null) {
            entity.setVerifyResult(verifyResult);
        }
        entity.setIssueStatus(ISSUE_CLOSED);
        mapper.updateById(entity);
    }

    /** 进入验证阶段。 */
    @Transactional
    public void startVerify(Long id) {
        OaBizSampleIssue entity = requireEntity(id);
        entity.setIssueStatus(ISSUE_VERIFYING);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizSampleIssue entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizSampleIssue requireEntity(Long id) {
        OaBizSampleIssue entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "样品试制问题单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizSampleIssue entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        if (WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus) && ISSUE_PROCESSING.equals(entity.getIssueStatus())) {
            entity.setIssueStatus(ISSUE_VERIFYING);
        }
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的问题单不可修改");
        }
    }

    private void validate(BizSampleIssueSaveRequest request) {
        if (!StringUtils.hasText(request.getIssueDesc())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "问题描述不能为空");
        }
    }

    private void apply(OaBizSampleIssue entity, BizSampleIssueSaveRequest request) {
        entity.setProjectCode(request.getProjectCode());
        entity.setProjectName(request.getProjectName());
        entity.setProductCode(request.getProductCode());
        entity.setBomCode(request.getBomCode());
        entity.setPartCode(request.getPartCode());
        entity.setPartName(request.getPartName());
        entity.setIssueType(request.getIssueType());
        entity.setIssueDesc(request.getIssueDesc());
        entity.setSeverity(request.getSeverity());
        entity.setResponsibleUserId(request.getResponsibleUserId());
        entity.setResponsibleName(request.getResponsibleName());
        entity.setDueDate(request.getDueDate());
        entity.setMeasure(request.getMeasure());
        entity.setVerifyResult(request.getVerifyResult());
        entity.setPlmRefNo(request.getPlmRefNo());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizSampleIssue entity) {
        return "样品试制问题-" + entity.getPartCode() + "-" + entity.getIssueNo();
    }

    private String buildFormJson(OaBizSampleIssue entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("issueNo", entity.getIssueNo());
        data.put("projectCode", entity.getProjectCode());
        data.put("partCode", entity.getPartCode());
        data.put("issueType", entity.getIssueType());
        data.put("issueDesc", entity.getIssueDesc());
        data.put("severity", entity.getSeverity());
        data.put("dueDate", entity.getDueDate() == null ? null : entity.getDueDate().toString());
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
