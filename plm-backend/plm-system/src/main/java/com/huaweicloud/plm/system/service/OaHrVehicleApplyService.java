package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.HrFlowQuery;
import com.huaweicloud.plm.system.dto.HrVehicleApplySaveRequest;
import com.huaweicloud.plm.system.entity.OaHrVehicle;
import com.huaweicloud.plm.system.entity.OaHrVehicleApply;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaHrVehicleApplyMapper;
import com.huaweicloud.plm.system.mapper.OaHrVehicleMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 用车申请（OA-DEV-058）：车辆申请、派车信息与车辆使用时段冲突校验。
 */
@Service
@RequiredArgsConstructor
public class OaHrVehicleApplyService {

    /** 流程编码，与 oa_process_definition.process_code 对应。 */
    public static final String PROCESS_CODE = "OA_VEHICLE_APPLY_FLOW";

    /** 业务类型，流程终态事件据此回写本单据状态。 */
    public static final String BIZ_TYPE = "HR_VEHICLE_APPLY";

    private static final String STATUS_DRAFT = "DRAFT";

    /** 参与冲突判定的在途状态：审批中与已通过。 */
    private static final List<String> OCCUPY_STATUSES =
            List.of(WorkflowEngineService.INSTANCE_RUNNING, WorkflowInstanceEvent.STATUS_APPROVED);

    private final OaHrVehicleApplyMapper vehicleApplyMapper;
    private final OaHrVehicleMapper vehicleMapper;
    private final SysUserMapper userMapper;
    private final HrFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaHrVehicleApply> page(HrFlowQuery query, Long applicantUserId) {
        Page<OaHrVehicleApply> page = query.toPage();
        vehicleApplyMapper.selectPage(page, Wrappers.<OaHrVehicleApply>lambdaQuery()
                .eq(applicantUserId != null, OaHrVehicleApply::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()),
                        OaHrVehicleApply::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaHrVehicleApply::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null,
                        OaHrVehicleApply::getApplicantUserId, query.getApplicantUserId())
                .ge(StringUtils.hasText(query.getStartDate()), OaHrVehicleApply::getStartTime,
                        HrFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaHrVehicleApply::getEndTime,
                        HrFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaHrVehicleApply::getApplyNo, query.getKeyword()).or()
                        .like(OaHrVehicleApply::getApplicantName, query.getKeyword()).or()
                        .like(OaHrVehicleApply::getDestination, query.getKeyword()).or()
                        .like(OaHrVehicleApply::getPlateNo, query.getKeyword()))
                .orderByDesc(OaHrVehicleApply::getId));
        return PageResult.of(page);
    }

    public OaHrVehicleApply detail(Long id) {
        return requireApply(id);
    }

    @Transactional
    public Long save(Long id, HrVehicleApplySaveRequest request) {
        OaHrVehicleApply entity;
        if (id == null) {
            entity = new OaHrVehicleApply();
            entity.setApplyNo(flowSupport.nextFlowNo("VH"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireApply(id);
            ensureEditable(entity);
        }
        validate(request);
        apply(entity, request);
        if (id == null) {
            vehicleApplyMapper.insert(entity);
        } else {
            vehicleApplyMapper.updateById(entity);
        }
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaHrVehicleApply entity = requireApply(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        validateConflict(entity.getId(), entity.getVehicleId(), entity.getStartTime(), entity.getEndTime());
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        vehicleApplyMapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaHrVehicleApply entity = requireApply(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        vehicleApplyMapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaHrVehicleApply entity = requireApply(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        vehicleApplyMapper.deleteById(id);
    }

    public OaHrVehicleApply requireApply(Long id) {
        OaHrVehicleApply entity = vehicleApplyMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "用车申请单不存在: " + id);
        }
        return entity;
    }

    /** 车辆时段冲突校验：同一车辆在审批中或已通过的申请时段内不得重叠。 */
    public void validateConflict(Long excludeId, Long vehicleId, LocalDateTime start, LocalDateTime end) {
        if (vehicleId == null || start == null || end == null) {
            return;
        }
        Long count = vehicleApplyMapper.selectCount(Wrappers.<OaHrVehicleApply>lambdaQuery()
                .eq(OaHrVehicleApply::getVehicleId, vehicleId)
                .in(OaHrVehicleApply::getFlowStatus, OCCUPY_STATUSES)
                .ne(excludeId != null, OaHrVehicleApply::getId, excludeId)
                .lt(OaHrVehicleApply::getStartTime, end)
                .gt(OaHrVehicleApply::getEndTime, start));
        if (count != null && count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该车辆在所选时段已被占用");
        }
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaHrVehicleApply entity = vehicleApplyMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        vehicleApplyMapper.updateById(entity);
    }

    private boolean isSubmittable(String flowStatus) {
        return STATUS_DRAFT.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_REJECTED.equals(flowStatus)
                || WorkflowInstanceEvent.STATUS_CANCELLED.equals(flowStatus);
    }

    private void ensureEditable(OaHrVehicleApply entity) {
        String status = entity.getFlowStatus();
        if (WorkflowEngineService.INSTANCE_RUNNING.equals(status)
                || WorkflowInstanceEvent.STATUS_APPROVED.equals(status)) {
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的用车申请单不可修改");
        }
    }

    private void validate(HrVehicleApplySaveRequest request) {
        if (request.getStartTime() == null || request.getEndTime() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用车开始时间与结束时间不能为空");
        }
        if (request.getEndTime().isBefore(request.getStartTime())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "用车结束时间不能早于开始时间");
        }
    }

    private void apply(OaHrVehicleApply entity, HrVehicleApplySaveRequest request) {
        entity.setVehicleId(request.getVehicleId());
        entity.setPlateNo(resolvePlateNo(request.getVehicleId()));
        entity.setDriverUserId(request.getDriverUserId());
        entity.setDriverName(resolveUserName(request.getDriverUserId()));
        entity.setStartTime(request.getStartTime());
        entity.setEndTime(request.getEndTime());
        entity.setDestination(request.getDestination());
        entity.setPurpose(request.getPurpose());
        entity.setPassengerCount(request.getPassengerCount());
        entity.setMileage(request.getMileage());
        entity.setCostAmount(request.getCostAmount());
        entity.setRemark(request.getRemark());
    }

    private String resolvePlateNo(Long vehicleId) {
        if (vehicleId == null) {
            return null;
        }
        OaHrVehicle vehicle = vehicleMapper.selectById(vehicleId);
        return vehicle == null ? null : vehicle.getPlateNo();
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

    private String buildTitle(OaHrVehicleApply entity) {
        return "用车申请-" + entity.getApplicantName() + "-" + entity.getApplyNo();
    }

    private String buildFormJson(OaHrVehicleApply entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("applyNo", entity.getApplyNo());
        data.put("applicantName", entity.getApplicantName());
        data.put("plateNo", entity.getPlateNo());
        data.put("driverName", entity.getDriverName());
        data.put("startTime", entity.getStartTime() == null ? null : entity.getStartTime().toString());
        data.put("endTime", entity.getEndTime() == null ? null : entity.getEndTime().toString());
        data.put("destination", entity.getDestination());
        data.put("purpose", entity.getPurpose());
        data.put("passengerCount", entity.getPassengerCount());
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
