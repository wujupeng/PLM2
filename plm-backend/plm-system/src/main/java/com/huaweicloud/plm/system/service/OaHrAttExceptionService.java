package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrAttExceptionSaveRequest;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.entity.OaHrAttendanceException;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrAttendanceExceptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 考勤异常处理单（OA-DEV-057）：迟到/早退/缺卡等异常申诉与补办审批。
 * 本模块只承载异常申请与处理结果，原始打卡事实由权威考勤源提供，不在此修改或替代。
 */
@Service
@RequiredArgsConstructor
public class OaHrAttExceptionService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_ATT_EXCEPTION_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_ATT_EXCEPTION";

    private static final String STATUS_DRAFT = "DRAFT";

    private final OaHrAttendanceExceptionMapper attExceptionMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaHrAttendanceException> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrAttendanceException> page = query.toPage();
        attExceptionMapper.selectPage(page, Wrappers.<OaHrAttendanceException>lambdaQuery()
                .eq(applicantUserId != null, OaHrAttendanceException::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()),
                        OaHrAttendanceException::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrAttendanceException::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null,
                        OaHrAttendanceException::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrAttendanceException::getExceptionDate,
                        startDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrAttendanceException::getExceptionDate,
                        endDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrAttendanceException::getExceptionNo, query.getKeyword()).or()
                        .like(OaHrAttendanceException::getApplicantName, query.getKeyword()).or()
                        .like(OaHrAttendanceException::getApplyReason, query.getKeyword()))
                .orderByDesc(OaHrAttendanceException::getId));
        return PageResult.of(page);
    }

    public OaHrAttendanceException detail(Long id) {
        return requireException(id);
    }

    @Transactional
    public Long save(Long id, HrAttExceptionSaveRequest request) {
        OaHrAttendanceException entity;
        if (id == null) {
            entity = new OaHrAttendanceException();
            entity.setExceptionNo(flowSupport.nextFlowNo("ATT"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireException(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            attExceptionMapper.insert(entity);
        } else {
            attExceptionMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaHrAttendanceException entity = requireException(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        attExceptionMapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaHrAttendanceException entity = requireException(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        attExceptionMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaHrAttendanceException entity = requireException(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        attExceptionMapper.deleteById(id);
    }

    public OaHrAttendanceException requireException(Long id) {
        OaHrAttendanceException entity = attExceptionMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "考勤异常单不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrAttendanceException entity = attExceptionMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        attExceptionMapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrAttendanceException entity) {
        String status = entity.getFlowStatus();
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(status)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的考勤异常单不可修改");
        }
    }

    private void validate(HrAttExceptionSaveRequest request) {
        if (request.getExceptionDate() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "异常日期不能为空");
        }
        int forwardDays = flowSupport.configInt("oa.hr.attendance.forward.days", 0);
        if (forwardDays > 0 && request.getExceptionDate().isBefore(LocalDate.now().minusDays(forwardDays))) {
            throw new BusinessException(ResultCode.BAD_REQUEST,
                    "考勤异常需在发生之日起 " + forwardDays + " 天内申请补办，如需调整请联系管理员配置");
        }
    }

    private void apply(OaHrAttendanceException entity, HrAttExceptionSaveRequest request) {
        entity.setExceptionType(request.getExceptionType());
        entity.setExceptionDate(request.getExceptionDate());
        entity.setExceptionDesc(request.getExceptionDesc());
        entity.setApplyReason(request.getApplyReason());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaHrAttendanceException entity) {
        return "考勤异常申请-" + entity.getApplicantName() + "-" + entity.getExceptionNo();
    }

    private String buildFormJson(OaHrAttendanceException entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("exceptionNo", entity.getExceptionNo());
        data.put("applicantName", entity.getApplicantName());
        data.put("exceptionType", entity.getExceptionType());
        data.put("exceptionDate", entity.getExceptionDate() == null ? null : entity.getExceptionDate().toString());
        data.put("exceptionDesc", entity.getExceptionDesc());
        data.put("applyReason", entity.getApplyReason());
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }

    private LocalDate startDate(String date) {
        var value = HrFlowSupport.startOfDay(date);
        return value == null ? null : value.toLocalDate();
    }

    private LocalDate endDate(String date) {
        var value = HrFlowSupport.endOfDay(date);
        return value == null ? null : value.toLocalDate();
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
