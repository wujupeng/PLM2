package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrLeaveSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrLeave;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrLeaveMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 请假流程包（OA-DEV-054）：请假单草稿、提交审批、撤回与流程终态回写。
 * 假种、补单标记、附件要求、单次天数上限等均为可配置项，审批路径由 OA-N3 工作流引擎承载。
 */
@Service
@RequiredArgsConstructor
public class OaHrLeaveService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_LEAVE_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_LEAVE";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaHrLeaveMapper leaveMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    /** 请假单分页：applicantUserId 非空时仅查询该申请人的单据（我的申请）。 */
    public PageResult<OaHrLeave> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrLeave> page = query.toPage();
        leaveMapper.selectPage(page, Wrappers.<OaHrLeave>lambdaQuery()
                .eq(applicantUserId != null, OaHrLeave::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaHrLeave::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrLeave::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaHrLeave::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrLeave::getStartTime,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrLeave::getEndTime,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrLeave::getLeaveNo, query.getKeyword()).or()
                        .like(OaHrLeave::getApplicantName, query.getKeyword()).or()
                        .like(OaHrLeave::getReason, query.getKeyword()))
                .orderByDesc(OaHrLeave::getId));
        return PageResult.of(page);
    }

    public OaHrLeave detail(Long id) {
        return requireLeave(id);
    }

    /** 保存请假单：无 id 为新建，有 id 为修改；submit=true 时保存后直接发起审批。 */
    @Transactional
    public Long save(Long id, HrLeaveSaveRequest request) {
        OaHrLeave entity;
        if (id == null) {
            entity = new OaHrLeave();
            entity.setLeaveNo(flowSupport.nextFlowNo("LV"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireLeave(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            leaveMapper.insert(entity);
        } else {
            leaveMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    /** 提交审批：创建流程实例并回写流程实例信息。 */
    @Transactional
    public void submit(Long id) {
        OaHrLeave entity = requireLeave(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        leaveMapper.updateById(entity);
    }

    /** 撤回：仅审批中的单据可撤回，撤回后置为已撤回。 */
    @Transactional
    public void withdraw(Long id) {
        OaHrLeave entity = requireLeave(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        leaveMapper.updateById(entity);
    }

    /** 删除：仅草稿状态可删除。 */
    @Transactional
    public void delete(Long id) {
        OaHrLeave entity = requireLeave(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        leaveMapper.deleteById(id);
    }

    public OaHrLeave requireLeave(Long id) {
        OaHrLeave entity = leaveMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "请假单不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrLeave entity = leaveMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        leaveMapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrLeave entity) {
        String status = entity.getFlowStatus();
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(status)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的请假单不可修改");
        }
    }

    private void validate(HrLeaveSaveRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请假开始时间与结束时间不能为空");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "请假结束时间不能早于开始时间");
        }
        int maxDays = flowSupport.configInt("oa.hr.leave.max.days.per.apply", 0);
        if (maxDays > 0 && request.getLeaveDays() != null
                && request.getLeaveDays().compareTo(BigDecimal.valueOf(maxDays)) > 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "单次请假天数不得超过 " + maxDays + " 天，如需调整请联系管理员配置");
        }
    }

    private void apply(OaHrLeave entity, HrLeaveSaveRequest request) {
        entity.setLeaveType(request.getLeaveType());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setLeaveDays(request.getLeaveDays());
        entity.setReason(request.getReason());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setMakeUpFlag(request.getMakeUpFlag() == null ? 0 : request.getMakeUpFlag());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaHrLeave entity) {
        return "请假申请-" + entity.getApplicantName() + "-" + entity.getLeaveNo();
    }

    private String buildFormJson(OaHrLeave entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("leaveNo", entity.getLeaveNo());
        data.put("applicantName", entity.getApplicantName());
        data.put("leaveType", entity.getLeaveType());
        data.put("startTime", entity.getStartTime() == null ? null : entity.getStartTime().toString());
        data.put("endTime", entity.getEndTime() == null ? null : entity.getEndTime().toString());
        data.put("leaveDays", entity.getLeaveDays());
        data.put("reason", entity.getReason());
        data.put("makeUpFlag", entity.getMakeUpFlag());
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
