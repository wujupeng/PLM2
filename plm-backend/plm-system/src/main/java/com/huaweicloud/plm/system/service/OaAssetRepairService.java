package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizAssetRepairAcceptRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairDispatchRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairHandleRequest;
import com.huaweicloud.plm.system.dto.BizAssetRepairSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaAssetRepairOrder;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaAssetRepairOrderMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 设备维修工单（OA-DEV-078）：机工/模具/测试仪表量具夹具/电脑四类维修的申请、派工、处理、验收、关闭。
 * 资产类别、维修字段与审批路径均为可配置项，审批流转由 OA-N3 工作流引擎承载；
 * 资产台账权威归属资产/财务系统（oa.asset.repair.asset.ledger.sync.enabled 可配置），OA 仅承载维修协同。
 */
@Service
@RequiredArgsConstructor
public class OaAssetRepairService {

    public static final String PROCESS_CODE = "OA_ASSET_REPAIR_FLOW";

    public static final String BIZ_TYPE = "BIZ_ASSET_REPAIR";

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_PENDING_DISPATCH = "PENDING_DISPATCH";
    private static final String STATUS_DISPATCHED = "DISPATCHED";
    private static final String STATUS_HANDLED = "HANDLED";
    private static final String STATUS_ACCEPTED = "ACCEPTED";
    private static final String STATUS_CLOSED = "CLOSED";

    private final OaAssetRepairOrderMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaAssetRepairOrder> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaAssetRepairOrder> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaAssetRepairOrder>lambdaQuery()
                .eq(applicantUserId != null, OaAssetRepairOrder::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaAssetRepairOrder::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaAssetRepairOrder::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaAssetRepairOrder::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaAssetRepairOrder::getAssetCategory, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaAssetRepairOrder::getReportTime,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaAssetRepairOrder::getReportTime,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaAssetRepairOrder::getRepairNo, query.getKeyword()).or()
                        .like(OaAssetRepairOrder::getAssetCode, query.getKeyword()).or()
                        .like(OaAssetRepairOrder::getAssetName, query.getKeyword()))
                .orderByDesc(OaAssetRepairOrder::getId));
        return PageResult.of(page);
    }

    public OaAssetRepairOrder detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizAssetRepairSaveRequest request) {
        OaAssetRepairOrder entity;
        if (id == null) {
            entity = new OaAssetRepairOrder();
            entity.setRepairNo(flowSupport.nextBizNo("AR"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setRepairStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
            entity.setReportTime(LocalDateTime.now());
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
        OaAssetRepairOrder entity = requireEntity(id);
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
        OaAssetRepairOrder entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的维修单可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setRepairStatus(STATUS_DRAFT);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaAssetRepairOrder entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的维修单可删除");
        }
        mapper.deleteById(id);
    }

    /** 派工：审批通过后由维修管理员指派维修人。 */
    @Transactional
    public void dispatch(Long id, BizAssetRepairDispatchRequest request) {
        OaAssetRepairOrder entity = requireEntity(id);
        requireApproved(entity);
        if (!STATUS_PENDING_DISPATCH.equals(entity.getRepairStatus()) && !STATUS_DRAFT.equals(entity.getRepairStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前维修状态不可派工: " + entity.getRepairStatus());
        }
        if (request == null || request.getAssigneeUserId() == null) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "维修人不能为空");
        }
        entity.setAssigneeUserId(request.getAssigneeUserId());
        entity.setAssigneeName(request.getAssigneeName());
        entity.setDispatchRemark(request.getDispatchRemark());
        entity.setDispatchTime(LocalDateTime.now());
        entity.setRepairStatus(STATUS_DISPATCHED);
        mapper.updateById(entity);
    }

    /** 处理：维修人填写故障原因、维修措施、备件、工时与费用。 */
    @Transactional
    public void handle(Long id, BizAssetRepairHandleRequest request) {
        OaAssetRepairOrder entity = requireEntity(id);
        requireApproved(entity);
        if (!STATUS_DISPATCHED.equals(entity.getRepairStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅已派工的维修单可登记处理结果");
        }
        if (request == null || !StringUtils.hasText(request.getRepairMeasure())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "维修措施不能为空");
        }
        entity.setFaultCause(request.getFaultCause());
        entity.setRepairMeasure(request.getRepairMeasure());
        entity.setSpareParts(request.getSpareParts());
        entity.setWorkHours(request.getWorkHours());
        entity.setRepairCost(request.getRepairCost());
        entity.setDowntimeMinutes(request.getDowntimeMinutes());
        entity.setRepeatFlag(Boolean.TRUE.equals(request.getRepeatFlag()) ? 1 : 0);
        entity.setRepairFinishTime(LocalDateTime.now());
        entity.setRepairStatus(STATUS_HANDLED);
        mapper.updateById(entity);
    }

    /** 验收：维修结果由报修人验收确认（是否需验收由可配置项控制）。 */
    @Transactional
    public void accept(Long id, BizAssetRepairAcceptRequest request) {
        OaAssetRepairOrder entity = requireEntity(id);
        requireApproved(entity);
        if (!STATUS_HANDLED.equals(entity.getRepairStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅已处理完成的维修单可验收");
        }
        if (!flowSupport.configBoolean("oa.asset.repair.need.acceptance", true)) {
            throw new BusinessException(ResultCode.CONFLICT, "按当前配置维修单无需单独验收，可直接关闭");
        }
        if (request == null || !StringUtils.hasText(request.getAcceptResult())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "验收结果不能为空");
        }
        entity.setAcceptResult(request.getAcceptResult());
        entity.setAcceptOpinion(request.getAcceptOpinion());
        entity.setAcceptUserId(UserContext.getUserId());
        entity.setAcceptUserName(currentDisplayName());
        entity.setAcceptTime(LocalDateTime.now());
        entity.setRepairStatus(STATUS_ACCEPTED);
        mapper.updateById(entity);
    }

    /** 关闭：验收通过或按配置免验收时关闭工单。 */
    @Transactional
    public void close(Long id) {
        OaAssetRepairOrder entity = requireEntity(id);
        requireApproved(entity);
        boolean needAcceptance = flowSupport.configBoolean("oa.asset.repair.need.acceptance", true);
        String expected = needAcceptance ? STATUS_ACCEPTED : STATUS_HANDLED;
        if (!expected.equals(entity.getRepairStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前维修状态不可关闭: " + entity.getRepairStatus());
        }
        entity.setRepairStatus(STATUS_CLOSED);
        entity.setCloseTime(LocalDateTime.now());
        mapper.updateById(entity);
    }

    public OaAssetRepairOrder requireEntity(Long id) {
        OaAssetRepairOrder entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "设备维修工单不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。审批通过后进入待派工。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaAssetRepairOrder entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        if (WorkflowInstanceEvent.STATUS_APPROVED.equals(flowStatus)
                && (STATUS_DRAFT.equals(entity.getRepairStatus()) || entity.getRepairStatus() == null)) {
            entity.setRepairStatus(STATUS_PENDING_DISPATCH);
        }
        mapper.updateById(entity);
    }

    private void requireApproved(OaAssetRepairOrder entity) {
        if (!WorkflowInstanceEvent.STATUS_APPROVED.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "维修单审批通过后方可执行该操作");
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的维修单不可修改");
        }
    }

    private void validate(BizAssetRepairSaveRequest request) {
        if (!StringUtils.hasText(request.getAssetCategory())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "资产类别不能为空");
        }
        if (!StringUtils.hasText(request.getAssetCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "资产编码不能为空");
        }
        if (!StringUtils.hasText(request.getFaultDesc())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "故障描述不能为空");
        }
    }

    private void apply(OaAssetRepairOrder entity, BizAssetRepairSaveRequest request) {
        entity.setAssetCategory(request.getAssetCategory());
        entity.setAssetCode(request.getAssetCode());
        entity.setAssetName(request.getAssetName());
        entity.setAssetModel(request.getAssetModel());
        entity.setLocation(request.getLocation());
        entity.setFaultType(request.getFaultType());
        entity.setFaultDesc(request.getFaultDesc());
        entity.setPriority(StringUtils.hasText(request.getPriority()) ? request.getPriority() : "NORMAL");
        entity.setRequireFinish(request.getRequireFinish());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaAssetRepairOrder entity) {
        return "设备维修申请-" + entity.getAssetName() + "-" + entity.getRepairNo();
    }

    private String buildFormJson(OaAssetRepairOrder entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("repairNo", entity.getRepairNo());
        data.put("assetCategory", entity.getAssetCategory());
        data.put("assetCode", entity.getAssetCode());
        data.put("assetName", entity.getAssetName());
        data.put("faultType", entity.getFaultType());
        data.put("faultDesc", entity.getFaultDesc());
        data.put("priority", entity.getPriority());
        data.put("requireFinish", entity.getRequireFinish());
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
