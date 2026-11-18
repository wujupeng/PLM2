package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizInspectionRequestSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizInspectionRequest;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizInspectionRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 检测委托流程包（OA-DEV-070）：与 QMS/实验室系统接口边界明确。
 * QMS 为检测台账权威，OA 承载委托审批与协同；同步开关为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaBizInspectionRequestService {

    public static final String PROCESS_CODE = "OA_INSPECTION_FLOW";

    public static final String BIZ_TYPE = "BIZ_INSPECTION";

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String RESULT_PENDING = "PENDING";

    private final OaBizInspectionRequestMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizInspectionRequest> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizInspectionRequest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizInspectionRequest>lambdaQuery()
                .eq(applicantUserId != null, OaBizInspectionRequest::getRequesterUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizInspectionRequest::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizInspectionRequest::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizInspectionRequest::getResultStatus, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizInspectionRequest::getRequireDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizInspectionRequest::getRequireDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizInspectionRequest::getRequestNo, query.getKeyword()).or()
                        .like(OaBizInspectionRequest::getMaterialCode, query.getKeyword()).or()
                        .like(OaBizInspectionRequest::getBatchNo, query.getKeyword()))
                .orderByDesc(OaBizInspectionRequest::getId));
        return PageResult.of(page);
    }

    public OaBizInspectionRequest detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizInspectionRequestSaveRequest request) {
        OaBizInspectionRequest entity;
        if (id == null) {
            entity = new OaBizInspectionRequest();
            entity.setRequestNo(flowSupport.nextBizNo("IR"));
            entity.setRequesterUserId(UserContext.getUserId());
            entity.setRequesterName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setResultStatus(StringUtils.hasText(request.getResultStatus()) ? request.getResultStatus() : RESULT_PENDING);
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
        OaBizInspectionRequest entity = requireEntity(id);
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
        OaBizInspectionRequest entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 登记检测结果：委托受理后由实验室录入结果（QMS 为权威，本方法仅记录 OA 协同结果）。 */
    @Transactional
    public void recordResult(Long id, String resultStatus, String resultDesc, String reportAttachmentJson, String qmsRefNo) {
        OaBizInspectionRequest entity = requireEntity(id);
        entity.setResultStatus(StringUtils.hasText(resultStatus) ? resultStatus : entity.getResultStatus());
        entity.setResultDesc(resultDesc);
        entity.setReportAttachmentJson(reportAttachmentJson);
        entity.setQmsRefNo(qmsRefNo);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizInspectionRequest entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizInspectionRequest requireEntity(Long id) {
        OaBizInspectionRequest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "检测委托单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizInspectionRequest entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的检测委托单不可修改");
        }
    }

    private void validate(BizInspectionRequestSaveRequest request) {
        if (!StringUtils.hasText(request.getMaterialCode()) && !StringUtils.hasText(request.getBatchNo())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "物料编码与批次号至少填写一项");
        }
    }

    private void apply(OaBizInspectionRequest entity, BizInspectionRequestSaveRequest request) {
        entity.setRequestDeptId(request.getRequestDeptId());
        entity.setRequestDeptName(request.getRequestDeptName());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setBatchNo(request.getBatchNo());
        entity.setSampleQty(request.getSampleQty());
        entity.setInspectionItems(request.getInspectionItems());
        entity.setRequireDate(request.getRequireDate());
        entity.setLabName(request.getLabName());
        entity.setResultStatus(StringUtils.hasText(request.getResultStatus()) ? request.getResultStatus() : RESULT_PENDING);
        entity.setResultDesc(request.getResultDesc());
        entity.setReportAttachmentJson(request.getReportAttachmentJson());
        entity.setQmsRefNo(request.getQmsRefNo());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizInspectionRequest entity) {
        return "检测委托-" + entity.getMaterialCode() + "-" + entity.getRequestNo();
    }

    private String buildFormJson(OaBizInspectionRequest entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestNo", entity.getRequestNo());
        data.put("materialCode", entity.getMaterialCode());
        data.put("batchNo", entity.getBatchNo());
        data.put("sampleQty", entity.getSampleQty());
        data.put("inspectionItems", entity.getInspectionItems());
        data.put("requireDate", entity.getRequireDate() == null ? null : entity.getRequireDate().toString());
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
