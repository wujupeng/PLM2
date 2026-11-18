package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizDeliveryCoordinationSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizDeliveryCoordination;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizDeliveryCoordinationMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 交期延误协调单流程包（OA-DEV-064）：问题闭环与责任跟踪。
 * 承诺交期确定后按延误天数自动计算，闭环状态按问题严重程度由业务方流程控制。
 */
@Service
@RequiredArgsConstructor
public class OaBizDeliveryCoordinationService {

    public static final String PROCESS_CODE = "OA_DELIVERY_FLOW";

    public static final String BIZ_TYPE = "BIZ_DELIVERY";

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String CLOSE_OPEN = "OPEN";

    private static final String CLOSE_PROCESSING = "PROCESSING";

    private static final String CLOSE_CLOSED = "CLOSED";

    private final OaBizDeliveryCoordinationMapper mapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizDeliveryCoordination> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizDeliveryCoordination> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizDeliveryCoordination>lambdaQuery()
                .eq(applicantUserId != null, OaBizDeliveryCoordination::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizDeliveryCoordination::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizDeliveryCoordination::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaBizDeliveryCoordination::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizDeliveryCoordination::getCloseStatus, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizDeliveryCoordination::getPromisedDelivery,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizDeliveryCoordination::getPromisedDelivery,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizDeliveryCoordination::getCoordNo, query.getKeyword()).or()
                        .like(OaBizDeliveryCoordination::getOrderNo, query.getKeyword()).or()
                        .like(OaBizDeliveryCoordination::getCustomerName, query.getKeyword()))
                .orderByDesc(OaBizDeliveryCoordination::getId));
        return PageResult.of(page);
    }

    public OaBizDeliveryCoordination detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizDeliveryCoordinationSaveRequest request) {
        OaBizDeliveryCoordination entity;
        if (id == null) {
            entity = new OaBizDeliveryCoordination();
            entity.setCoordNo(flowSupport.nextBizNo("DC"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setCloseStatus(CLOSE_OPEN);
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
        OaBizDeliveryCoordination entity = requireEntity(id);
        if (!isSubmittable(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "当前状态不可提交审批: " + entity.getFlowStatus());
        }
        OaProcessInstance instance = flowSupport.startFlow(PROCESS_CODE, BIZ_TYPE, entity.getId(),
                buildTitle(entity), buildFormJson(entity));
        entity.setFlowStatus(WorkflowEngineService.INSTANCE_RUNNING);
        entity.setInstanceId(instance.getId());
        entity.setInstanceNo(instance.getInstanceNo());
        if (CLOSE_OPEN.equals(entity.getCloseStatus())) {
            entity.setCloseStatus(CLOSE_PROCESSING);
        }
        mapper.updateById(entity);
    }

    @Transactional
    public void withdraw(Long id) {
        OaBizDeliveryCoordination entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 闭环：填写纠正措施并闭环。 */
    @Transactional
    public void close(Long id, String correctiveAction) {
        OaBizDeliveryCoordination entity = requireEntity(id);
        entity.setCorrectiveAction(correctiveAction);
        entity.setCloseStatus(CLOSE_CLOSED);
        entity.setCloseTime(LocalDateTime.now());
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaBizDeliveryCoordination entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        mapper.deleteById(id);
    }

    public OaBizDeliveryCoordination requireEntity(Long id) {
        OaBizDeliveryCoordination entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "交期延误协调单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizDeliveryCoordination entity = mapper.selectById(id);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的交期协调单不可修改");
        }
    }

    private void validate(BizDeliveryCoordinationSaveRequest request) {
        if (!StringUtils.hasText(request.getOrderNo()) && !StringUtils.hasText(request.getMaterialCode())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "订单号与物料编码至少填写一项");
        }
    }

    private void apply(OaBizDeliveryCoordination entity, BizDeliveryCoordinationSaveRequest request) {
        entity.setOrderNo(request.getOrderNo());
        entity.setCustomerCode(request.getCustomerCode());
        entity.setCustomerName(request.getCustomerName());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setDemandQty(request.getDemandQty());
        entity.setOriginalDelivery(request.getOriginalDelivery());
        entity.setPromisedDelivery(request.getPromisedDelivery());
        if (request.getOriginalDelivery() != null && request.getPromisedDelivery() != null) {
            long days = ChronoUnit.DAYS.between(request.getOriginalDelivery(), request.getPromisedDelivery());
            entity.setDelayDays(days > 0 ? (int) days : 0);
        } else {
            entity.setDelayDays(0);
        }
        entity.setDelayReason(request.getDelayReason());
        entity.setCapacityNote(request.getCapacityNote());
        entity.setShortageReason(request.getShortageReason());
        entity.setResponsibleDept(request.getResponsibleDept());
        entity.setResponsibleUserId(request.getResponsibleUserId());
        entity.setResponsibleName(request.getResponsibleName());
        entity.setCorrectiveAction(request.getCorrectiveAction());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizDeliveryCoordination entity) {
        return "交期延误协调-" + entity.getOrderNo() + "-" + entity.getCoordNo();
    }

    private String buildFormJson(OaBizDeliveryCoordination entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("coordNo", entity.getCoordNo());
        data.put("orderNo", entity.getOrderNo());
        data.put("materialCode", entity.getMaterialCode());
        data.put("originalDelivery", entity.getOriginalDelivery() == null ? null : entity.getOriginalDelivery().toString());
        data.put("promisedDelivery", entity.getPromisedDelivery() == null ? null : entity.getPromisedDelivery().toString());
        data.put("delayDays", entity.getDelayDays());
        data.put("delayReason", entity.getDelayReason());
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
