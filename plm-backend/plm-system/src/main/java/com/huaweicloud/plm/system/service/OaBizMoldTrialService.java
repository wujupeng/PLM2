package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMoldTrialSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizMoldTrial;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizMoldTrialMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 新开模检查与零件试流流程包（OA-DEV-077）：与 PLM 物料和质量问题关联。
 */
@Service
@RequiredArgsConstructor
public class OaBizMoldTrialService {

    public static final String PROCESS_CODE = "OA_MOLD_TRIAL_FLOW";

    public static final String BIZ_TYPE = "BIZ_MOLD";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaBizMoldTrialMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizMoldTrial> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizMoldTrial> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizMoldTrial>lambdaQuery()
                .eq(applicantUserId != null, OaBizMoldTrial::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizMoldTrial::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizMoldTrial::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizMoldTrial::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizMoldTrial::getTrialType, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizMoldTrial::getTrialDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizMoldTrial::getTrialDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizMoldTrial::getTrialNo, query.getKeyword()).or()
                        .like(OaBizMoldTrial::getPartCode, query.getKeyword()).or()
                        .like(OaBizMoldTrial::getMoldCode, query.getKeyword()))
                .orderByDesc(OaBizMoldTrial::getId));
        return PageResult.of(page);
    }

    public OaBizMoldTrial detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizMoldTrialSaveRequest request) {
        OaBizMoldTrial entity;
        if (id == null) {
            entity = new OaBizMoldTrial();
            entity.setTrialNo(flowSupport.nextBizNo("MT"));
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
        OaBizMoldTrial entity = requireEntity(id);
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
        OaBizMoldTrial entity = requireEntity(id);
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
        OaBizMoldTrial entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizMoldTrial requireEntity(Long id) {
        OaBizMoldTrial entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "新开模检查单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizMoldTrial entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的新开模检查单不可修改");
        }
    }

    private void validate(BizMoldTrialSaveRequest request) {
        if (!StringUtils.hasText(request.getTrialType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "检查/试流类型不能为空");
        }
        if (!StringUtils.hasText(request.getPartCode()) && !StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "零件编码与物料编码至少填写一项");
        }
    }

    private void apply(OaBizMoldTrial entity, BizMoldTrialSaveRequest request) {
        entity.setTrialType(request.getTrialType());
        entity.setMoldCode(request.getMoldCode());
        entity.setMoldName(request.getMoldName());
        entity.setPartCode(request.getPartCode());
        entity.setPartName(request.getPartName());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setSupplierCode(request.getSupplierCode());
        entity.setSupplierName(request.getSupplierName());
        entity.setCheckItems(request.getCheckItems());
        entity.setCheckResult(request.getCheckResult());
        entity.setTrialQty(request.getTrialQty());
        entity.setTrialResult(request.getTrialResult());
        entity.setTrialIssue(request.getTrialIssue());
        entity.setVerifyConclusion(request.getVerifyConclusion());
        entity.setPlmRefNo(request.getPlmRefNo());
        entity.setTrialDate(request.getTrialDate());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizMoldTrial entity) {
        return "新开模检查试流-" + entity.getPartCode() + "-" + entity.getTrialNo();
    }

    private String buildFormJson(OaBizMoldTrial entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("trialNo", entity.getTrialNo());
        data.put("trialType", entity.getTrialType());
        data.put("moldCode", entity.getMoldCode());
        data.put("partCode", entity.getPartCode());
        data.put("trialQty", entity.getTrialQty());
        data.put("trialDate", entity.getTrialDate() == null ? null : entity.getTrialDate().toString());
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
