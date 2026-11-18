package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizInternalAuditSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizInternalAudit;
import com.huaweicloud.plm.system.entity.OaBizInternalAuditIssue;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizInternalAuditIssueMapper;
import com.huaweicloud.plm.system.mapper.OaBizInternalAuditMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 内部审核实施计划流程包（OA-DEV-074）：审核计划与整改问题可追溯。
 */
@Service
@RequiredArgsConstructor
public class OaBizInternalAuditService {

    public static final String PROCESS_CODE = "OA_AUDIT_FLOW";

    public static final String BIZ_TYPE = "BIZ_AUDIT";

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String AUDIT_PLANNED = "PLANNED";

    private static final String AUDIT_RUNNING = "RUNNING";

    private static final String AUDIT_REPORTING = "REPORTING";

    private static final String AUDIT_CLOSED = "CLOSED";

    private final OaBizInternalAuditMapper mapper;
    private final OaBizInternalAuditIssueMapper issueMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizInternalAudit> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizInternalAudit> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizInternalAudit>lambdaQuery()
                .eq(applicantUserId != null, OaBizInternalAudit::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizInternalAudit::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizInternalAudit::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizInternalAudit::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizInternalAudit::getAuditStatus, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizInternalAudit::getPlanStart,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizInternalAudit::getPlanStart,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizInternalAudit::getAuditNo, query.getKeyword()).or()
                        .like(OaBizInternalAudit::getAuditPlanName, query.getKeyword()).or()
                        .like(OaBizInternalAudit::getAuditedDeptName, query.getKeyword()))
                .orderByDesc(OaBizInternalAudit::getId));
        return PageResult.of(page);
    }

    public OaBizInternalAudit detail(Long id) {
        return requireEntity(id);
    }

    public List<OaBizInternalAuditIssue> listIssues(Long auditId) {
        requireEntity(auditId);
        return issueMapper.selectList(Wrappers.<OaBizInternalAuditIssue>lambdaQuery()
                .eq(OaBizInternalAuditIssue::getAuditId, auditId)
                .orderByAsc(OaBizInternalAuditIssue::getSortNo)
                .orderByAsc(OaBizInternalAuditIssue::getId));
    }

    @Transactional
    public Long save(Long id, BizInternalAuditSaveRequest request) {
        OaBizInternalAudit entity;
        if (id == null) {
            entity = new OaBizInternalAudit();
            entity.setAuditNo(flowSupport.nextBizNo("IA"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setAuditStatus(AUDIT_PLANNED);
            entity.setIssueCount(0);
            entity.setCancelFlag(0);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        entity.setAuditPlanName(request.getAuditPlanName());
        entity.setAuditScope(request.getAuditScope());
        entity.setAuditStandard(request.getAuditStandard());
        entity.setPlanStart(request.getPlanStart());
        entity.setPlanEnd(request.getPlanEnd());
        entity.setAuditorUserIds(request.getAuditorUserIds());
        entity.setAuditorNames(request.getAuditorNames());
        entity.setAuditedDeptId(request.getAuditedDeptId());
        entity.setAuditedDeptName(request.getAuditedDeptName());
        entity.setAuditConclusion(request.getAuditConclusion());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        saveIssues(entity.getId(), request.getIssues());
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaBizInternalAudit entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        entity.setAuditStatus(AUDIT_RUNNING);
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizInternalAudit entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 报告编制阶段。 */
    @Transactional
    public void report(Long id, String auditConclusion) {
        OaBizInternalAudit entity = requireEntity(id);
        if (auditConclusion != null) {
            entity.setAuditConclusion(auditConclusion);
        }
        entity.setAuditStatus(AUDIT_REPORTING);
        mapper.updateById(entity);
    }

    /** 关闭审核计划。 */
    @Transactional
    public void close(Long id) {
        OaBizInternalAudit entity = requireEntity(id);
        entity.setAuditStatus(AUDIT_CLOSED);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizInternalAudit entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        issueMapper.delete(Wrappers.<OaBizInternalAuditIssue>lambdaQuery()
                .eq(OaBizInternalAuditIssue::getAuditId, id));
        mapper.deleteById(id);
    }

    public OaBizInternalAudit requireEntity(Long id) {
        OaBizInternalAudit entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "内部审核实施计划不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizInternalAudit entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
    }

    private void saveIssues(Long auditId, List<BizInternalAuditSaveRequest.Item> issues) {
        issueMapper.delete(Wrappers.<OaBizInternalAuditIssue>lambdaQuery()
                .eq(OaBizInternalAuditIssue::getAuditId, auditId));
        int sortNo = 1;
        if (issues != null) {
            for (BizInternalAuditSaveRequest.Item item : issues) {
                OaBizInternalAuditIssue row = new OaBizInternalAuditIssue();
                row.setAuditId(auditId);
                row.setIssueNo(String.format("Q%02d", sortNo));
                row.setIssueDesc(item.getIssueDesc());
                row.setIssueLevel(item.getIssueLevel());
                row.setResponsibleUserId(item.getResponsibleUserId());
                row.setResponsibleName(item.getResponsibleName());
                row.setDueDate(item.getDueDate());
                row.setCorrectAction(item.getCorrectAction());
                row.setVerifyResult(item.getVerifyResult());
                row.setIssueStatus("OPEN");
                row.setSortNo(sortNo++);
                row.setRemark(item.getRemark());
                issueMapper.insert(row);
            }
        }
        OaBizInternalAudit entity = mapper.selectById(auditId);
        if (entity != null) {
            entity.setIssueCount(issues == null ? 0 : issues.size());
            mapper.updateById(entity);
        }
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(String flowStatus) {
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的审核计划不可修改");
        }
    }

    private void validate(BizInternalAuditSaveRequest request) {
        if (!StringUtils.hasText(request.getAuditPlanName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "审核计划名称不能为空");
        }
    }

    private String buildTitle(OaBizInternalAudit entity) {
        return "内部审核计划-" + entity.getAuditPlanName() + "-" + entity.getAuditNo();
    }

    private String buildFormJson(OaBizInternalAudit entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("auditNo", entity.getAuditNo());
        data.put("auditPlanName", entity.getAuditPlanName());
        data.put("auditScope", entity.getAuditScope());
        data.put("auditStandard", entity.getAuditStandard());
        data.put("planStart", entity.getPlanStart() == null ? null : entity.getPlanStart().toString());
        data.put("planEnd", entity.getPlanEnd() == null ? null : entity.getPlanEnd().toString());
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
