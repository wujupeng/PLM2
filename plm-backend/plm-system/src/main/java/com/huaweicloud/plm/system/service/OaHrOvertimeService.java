package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrOvertimeSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrOvertime;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrOvertimeMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 加班流程包（OA-DEV-054）：加班单草稿、提交审批、撤回与流程终态回写。
 * 补偿方式默认值、最小时长等为可配置项。
 */
@Service
@RequiredArgsConstructor
public class OaHrOvertimeService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_OVERTIME_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_OVERTIME";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaHrOvertimeMapper overtimeMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaHrOvertime> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrOvertime> page = query.toPage();
        overtimeMapper.selectPage(page, Wrappers.<OaHrOvertime>lambdaQuery()
                .eq(applicantUserId != null, OaHrOvertime::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaHrOvertime::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrOvertime::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaHrOvertime::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrOvertime::getStartTime,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrOvertime::getEndTime,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrOvertime::getOvertimeNo, query.getKeyword()).or()
                        .like(OaHrOvertime::getApplicantName, query.getKeyword()).or()
                        .like(OaHrOvertime::getReason, query.getKeyword()))
                .orderByDesc(OaHrOvertime::getId));
        return PageResult.of(page);
    }

    public OaHrOvertime detail(Long id) {
        return requireOvertime(id);
    }

    @Transactional
    public Long save(Long id, HrOvertimeSaveRequest request) {
        OaHrOvertime entity;
        if (id == null) {
            entity = new OaHrOvertime();
            entity.setOvertimeNo(flowSupport.nextFlowNo("OT"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireOvertime(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            overtimeMapper.insert(entity);
        } else {
            overtimeMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaHrOvertime entity = requireOvertime(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        overtimeMapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaHrOvertime entity = requireOvertime(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        overtimeMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaHrOvertime entity = requireOvertime(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        overtimeMapper.deleteById(id);
    }

    public OaHrOvertime requireOvertime(Long id) {
        OaHrOvertime entity = overtimeMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "加班单不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrOvertime entity = overtimeMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        overtimeMapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrOvertime entity) {
        String status = entity.getFlowStatus();
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(status)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的加班单不可修改");
        }
    }

    private void validate(HrOvertimeSaveRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "加班开始时间与结束时间不能为空");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "加班结束时间不能早于开始时间");
        }
        BigDecimal minHours = BigDecimal.valueOf(flowSupport.configInt("oa.hr.overtime.min.hours", 0));
        if (minHours.signum() > 0 && request.getOvertimeHours() != null
                && request.getOvertimeHours().compareTo(minHours) < 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "加班时长不得少于 " + minHours.stripTrailingZeros().toPlainString() + " 小时");
        }
    }

    private void apply(OaHrOvertime entity, HrOvertimeSaveRequest request) {
        entity.setOvertimeType(request.getOvertimeType());
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setOvertimeHours(request.getOvertimeHours());
        String compensateType = request.getCompensateType();
        if (!StringUtils.hasText(compensateType)) {
            compensateType = flowSupport.configString("oa.hr.overtime.compensate.default", "COMPENSATORY");
        }
        entity.setCompensateType(compensateType);
        entity.setReason(request.getReason());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaHrOvertime entity) {
        return "加班申请-" + entity.getApplicantName() + "-" + entity.getOvertimeNo();
    }

    private String buildFormJson(OaHrOvertime entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("overtimeNo", entity.getOvertimeNo());
        data.put("applicantName", entity.getApplicantName());
        data.put("overtimeType", entity.getOvertimeType());
        data.put("startTime", entity.getStartTime() == null ? null : entity.getStartTime().toString());
        data.put("endTime", entity.getEndTime() == null ? null : entity.getEndTime().toString());
        data.put("overtimeHours", entity.getOvertimeHours());
        data.put("compensateType", entity.getCompensateType());
        data.put("reason", entity.getReason());
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
