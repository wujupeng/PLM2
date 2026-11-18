package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrResignationSaveRequest;
import com.huaweicloud.plm.system.entity.OaHrResignation;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.SysEmployment;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrResignationMapper;
import com.huaweicloud.plm.system.mapper.SysEmploymentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 离职申请流程（OA-DEV-055）：离职与交接清单、多部门会签、账号停用联动。
 * 审批通过后按可配置项 oa.hr.resignation.disable.account 自动停用账号，
 * 单据与流程记录均保留，历史责任链不删除。
 */
@Service
@RequiredArgsConstructor
public class OaHrResignationService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_RESIGNATION_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_RESIGNATION";

    private static final String STATUS_DRAFT = "DRAFT";

    /** 用户账号状态：0=停用。 */
    private static final int USER_STATUS_DISABLED = 0;

    private final OaHrResignationMapper resignationMapper;
    private final SysUserMapper userMapper;
    private final SysEmploymentMapper employmentMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaHrResignation> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrResignation> page = query.toPage();
        resignationMapper.selectPage(page, Wrappers.<OaHrResignation>lambdaQuery()
                .eq(applicantUserId != null, OaHrResignation::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaHrResignation::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrResignation::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null,
                        OaHrResignation::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrResignation::getLastWorkDate,
                        startDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrResignation::getLastWorkDate,
                        endDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrResignation::getResignationNo, query.getKeyword()).or()
                        .like(OaHrResignation::getApplicantName, query.getKeyword()).or()
                        .like(OaHrResignation::getReason, query.getKeyword()))
                .orderByDesc(OaHrResignation::getId));
        return PageResult.of(page);
    }

    public OaHrResignation detail(Long id) {
        return requireResignation(id);
    }

    @Transactional
    public Long save(Long id, HrResignationSaveRequest request) {
        OaHrResignation entity;
        if (id == null) {
            entity = new OaHrResignation();
            entity.setResignationNo(flowSupport.nextFlowNo("RS"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setPositionName(resolvePositionName(UserContext.getUserId()));
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setAccountDisabled(0);
            entity.setCancelFlag(0);
        } else {
            entity = requireResignation(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            resignationMapper.insert(entity);
        } else {
            resignationMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaHrResignation entity = requireResignation(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        resignationMapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaHrResignation entity = requireResignation(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        resignationMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaHrResignation entity = requireResignation(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        resignationMapper.deleteById(id);
    }

    public OaHrResignation requireResignation(Long id) {
        OaHrResignation entity = resignationMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "离职申请单不存在: " + id);
        }
        return entity;
    }

    /**
     * 流程终态回写：由 WorkflowInstanceEvent 监听器调用。
     * 审批通过时按配置执行账号停用联动，单据与流程记录保留，不做物理删除。
     */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrResignation entity = resignationMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        if (WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)) {
            disableAccountIfNeeded(entity);
        }
        resignationMapper.updateById(entity);
    }

    /** 账号停用联动：仅当单据标记需停用且配置开启时执行。 */
    private void disableAccountIfNeeded(OaHrResignation entity) {
        boolean flagOn = entity.getAccountDisableFlag() != null && entity.getAccountDisableFlag() == 1;
        boolean configOn = flowSupport.configBoolean("oa.hr.resignation.disable.account", true);
        if (!flagOn || !configOn || entity.getApplicantUserId() == null) {
            return;
        }
        SysUser user = userMapper.selectById(entity.getApplicantUserId());
        if (user == null) {
            return;
        }
        user.setStatus(USER_STATUS_DISABLED);
        userMapper.updateById(user);
        entity.setAccountDisabled(1);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrResignation entity) {
        String status = entity.getFlowStatus();
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(status)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的离职申请单不可修改");
        }
    }

    private void validate(HrResignationSaveRequest request) {
        if (request.getLastWorkDate() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "最后工作日期不能为空");
        }
    }

    private void apply(OaHrResignation entity, HrResignationSaveRequest request) {
        entity.setLastWorkDate(request.getLastWorkDate());
        entity.setResignationType(request.getResignationType());
        entity.setReason(request.getReason());
        entity.setHandoverJson(request.getHandoverJson());
        entity.setHandoverUserId(request.getHandoverUserId());
        entity.setHandoverUserName(resolveUserName(request.getHandoverUserId()));
        entity.setAccountDisableFlag(request.getAccountDisableFlag() == null ? 1 : request.getAccountDisableFlag());
        entity.setRemark(request.getRemark());
    }

    private String resolveUserName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }

    private String resolvePositionName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysEmployment employment = employmentMapper.selectOne(Wrappers.<SysEmployment>lambdaQuery()
                .eq(SysEmployment::getUserId, userId)
                .orderByDesc(SysEmployment::getId)
                .last("LIMIT 1"));
        return employment == null ? null : employment.getPositionName();
    }

    private String buildTitle(OaHrResignation entity) {
        return "离职申请-" + entity.getApplicantName() + "-" + entity.getResignationNo();
    }

    private String buildFormJson(OaHrResignation entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("resignationNo", entity.getResignationNo());
        data.put("applicantName", entity.getApplicantName());
        data.put("positionName", entity.getPositionName());
        data.put("lastWorkDate", entity.getLastWorkDate() == null ? null : entity.getLastWorkDate().toString());
        data.put("resignationType", entity.getResignationType());
        data.put("handoverUserName", entity.getHandoverUserName());
        data.put("reason", entity.getReason());
        try {
            return objectMapper.writeValueAsString(data);
        } catch (Exception e) {
            return "{}";
        }
    }

    private java.time.LocalDate startDate(String date) {
        var value = HrFlowSupport.startOfDay(date);
        return value == null ? null : value.toLocalDate();
    }

    private java.time.LocalDate endDate(String date) {
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
