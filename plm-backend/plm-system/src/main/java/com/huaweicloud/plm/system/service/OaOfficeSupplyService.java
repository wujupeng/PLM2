package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizOfficeSupplyRequestSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyItem;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyRequest;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyRequestItem;
import com.huaweicloud.plm.system.entity.OaOfficeSupplyTxn;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaOfficeSupplyItemMapper;
import com.huaweicloud.plm.system.mapper.OaOfficeSupplyRequestItemMapper;
import com.huaweicloud.plm.system.mapper.OaOfficeSupplyRequestMapper;
import com.huaweicloud.plm.system.mapper.OaOfficeSupplyTxnMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 办公用品申请（OA-DEV-081）：申请、审批、领用发放、库存台账与统计。
 * 是否启用库存管理、发放是否校验库存、需审批数量阈值均为可配置项，审批流转由 OA-N3 工作流引擎承载。
 */
@Service
@RequiredArgsConstructor
public class OaOfficeSupplyService {

    public static final String PROCESS_CODE = "OA_SUPPLY_FLOW";

    public static final String BIZ_TYPE = "BIZ_SUPPLY";

    private static final String STATUS_DRAFT = "DRAFT";
    private static final String STATUS_ISSUED = "ISSUED";

    private static final String TXN_ISSUE = "ISSUE";

    private final OaOfficeSupplyRequestMapper mapper;
    private final OaOfficeSupplyRequestItemMapper itemMapper;
    private final OaOfficeSupplyItemMapper supplyItemMapper;
    private final OaOfficeSupplyTxnMapper txnMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaOfficeSupplyRequest> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaOfficeSupplyRequest> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaOfficeSupplyRequest>lambdaQuery()
                .eq(applicantUserId != null, OaOfficeSupplyRequest::getApplicantUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaOfficeSupplyRequest::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaOfficeSupplyRequest::getOrgId, query.getOrgId())
                .eq(query.getApplicantUserId() != null, OaOfficeSupplyRequest::getApplicantUserId, query.getApplicantUserId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaOfficeSupplyRequest::getIssueStatus, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaOfficeSupplyRequest::getRequireDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaOfficeSupplyRequest::getRequireDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOfficeSupplyRequest::getRequestNo, query.getKeyword()).or()
                        .like(OaOfficeSupplyRequest::getPurpose, query.getKeyword()).or()
                        .like(OaOfficeSupplyRequest::getReceiverName, query.getKeyword()))
                .orderByDesc(OaOfficeSupplyRequest::getId));
        return PageResult.of(page);
    }

    public OaOfficeSupplyRequest detail(Long id) {
        return requireEntity(id);
    }

    /** 申请明细行。 */
    public List<OaOfficeSupplyRequestItem> listItems(Long requestId) {
        requireEntity(requestId);
        return itemMapper.selectList(Wrappers.<OaOfficeSupplyRequestItem>lambdaQuery()
                .eq(OaOfficeSupplyRequestItem::getRequestId, requestId)
                .orderByAsc(OaOfficeSupplyRequestItem::getSortNo)
                .orderByAsc(OaOfficeSupplyRequestItem::getId));
    }

    @Transactional
    public Long save(Long id, BizOfficeSupplyRequestSaveRequest request) {
        OaOfficeSupplyRequest entity;
        if (id == null) {
            entity = new OaOfficeSupplyRequest();
            entity.setRequestNo(flowSupport.nextBizNo("OS"));
            entity.setApplicantUserId(UserContext.getUserId());
            entity.setApplicantName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setIssueStatus(STATUS_DRAFT);
            entity.setCancelFlag(0);
        } else {
            entity = requireEntity(id);
            ensureEditable(entity.getFlowStatus());
        }
        validate(request);
        entity.setRequireDate(request.getRequireDate());
        entity.setPurpose(request.getPurpose());
        entity.setReceiverName(request.getReceiverName());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        saveItems(entity.getId(), request.getItems());
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaOfficeSupplyRequest entity = requireEntity(id);
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
        OaOfficeSupplyRequest entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的申请单可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setIssueStatus(STATUS_DRAFT);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    @Transactional
    public void delete(Long id) {
        OaOfficeSupplyRequest entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的申请单可删除");
        }
        itemMapper.delete(Wrappers.<OaOfficeSupplyRequestItem>lambdaQuery()
                .eq(OaOfficeSupplyRequestItem::getRequestId, id));
        mapper.deleteById(id);
    }

    /**
     * 发放领用：审批通过后按明细发放，可选扣减库存并写入台账。
     * 是否启用库存管理与库存校验由 oa.office.supply.stock.enabled / oa.office.supply.stock.verify 控制。
     */
    @Transactional
    public void issue(Long id, String issueRemark) {
        OaOfficeSupplyRequest entity = requireEntity(id);
        if (!WorkflowInstanceEvent.STATUS_APPROVED.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "申请单审批通过后方可发放");
        }
        if (STATUS_ISSUED.equals(entity.getIssueStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "申请单已发放");
        }
        List<OaOfficeSupplyRequestItem> items = listItems(id);
        if (items.isEmpty()) {
            throw new BusinessException(ResultCode.CONFLICT, "申请单无明细，无法发放");
        }
        boolean stockEnabled = flowSupport.configBoolean("oa.office.supply.stock.enabled", true);
        boolean stockVerify = flowSupport.configBoolean("oa.office.supply.stock.verify", true);
        for (OaOfficeSupplyRequestItem item : items) {
            BigDecimal qty = item.getRequestQty() == null ? BigDecimal.ZERO : item.getRequestQty();
            if (stockEnabled && item.getItemId() != null) {
                OaOfficeSupplyItem supplyItem = supplyItemMapper.selectById(item.getItemId());
                if (supplyItem != null && Integer.valueOf(1).equals(supplyItem.getNeedStock())) {
                    BigDecimal before = supplyItem.getStockQty() == null ? BigDecimal.ZERO : supplyItem.getStockQty();
                    if (stockVerify && before.compareTo(qty) < 0) {
                        throw new BusinessException(ResultCode.CONFLICT,
                                "库存不足，无法发放: " + supplyItem.getItemName());
                    }
                    BigDecimal after = before.subtract(qty);
                    supplyItem.setStockQty(after);
                    supplyItemMapper.updateById(supplyItem);
                    insertTxn(item, qty, before, after, entity.getRequestNo());
                }
            }
            item.setIssueQty(qty);
            itemMapper.updateById(item);
        }
        entity.setIssueStatus(STATUS_ISSUED);
        entity.setIssueTime(LocalDateTime.now());
        entity.setIssueRemark(issueRemark);
        mapper.updateById(entity);
    }

    public OaOfficeSupplyRequest requireEntity(Long id) {
        OaOfficeSupplyRequest entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "办公用品申请单不存在: " + id);
        }
        return entity;
    }

    /** 流程终态回写：由 WorkflowInstanceEvent 监听器调用。 */
    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaOfficeSupplyRequest entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
    }

    private void insertTxn(OaOfficeSupplyRequestItem item, BigDecimal qty, BigDecimal before, BigDecimal after,
                          String sourceNo) {
        OaOfficeSupplyTxn txn = new OaOfficeSupplyTxn();
        txn.setItemId(item.getItemId());
        txn.setItemCode(item.getItemCode());
        txn.setTxnType(TXN_ISSUE);
        txn.setTxnQty(qty);
        txn.setBeforeQty(before);
        txn.setAfterQty(after);
        txn.setSourceNo(sourceNo);
        txn.setOperatorUserId(UserContext.getUserId());
        txn.setOperatorName(currentDisplayName());
        txn.setTxnTime(LocalDateTime.now());
        txnMapper.insert(txn);
    }

    private void saveItems(Long requestId, List<BizOfficeSupplyRequestSaveRequest.Item> items) {
        itemMapper.delete(Wrappers.<OaOfficeSupplyRequestItem>lambdaQuery()
                .eq(OaOfficeSupplyRequestItem::getRequestId, requestId));
        BigDecimal totalQty = BigDecimal.ZERO;
        int sortNo = 1;
        if (items != null) {
            for (BizOfficeSupplyRequestSaveRequest.Item item : items) {
                OaOfficeSupplyRequestItem row = new OaOfficeSupplyRequestItem();
                row.setRequestId(requestId);
                row.setItemId(item.getItemId());
                row.setItemCode(item.getItemCode());
                row.setItemName(item.getItemName());
                row.setUnit(item.getUnit());
                row.setRequestQty(item.getRequestQty());
                row.setIssueQty(BigDecimal.ZERO);
                row.setSortNo(sortNo++);
                itemMapper.insert(row);
                if (item.getRequestQty() != null) {
                    totalQty = totalQty.add(item.getRequestQty());
                }
            }
        }
        OaOfficeSupplyRequest entity = mapper.selectById(requestId);
        if (entity != null) {
            entity.setItemCount(items == null ? 0 : items.size());
            entity.setTotalQty(totalQty);
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的申请单不可修改");
        }
    }

    private void validate(BizOfficeSupplyRequestSaveRequest request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "办公用品申请明细不能为空");
        }
    }

    private String buildTitle(OaOfficeSupplyRequest entity) {
        return "办公用品申请-" + entity.getRequestNo();
    }

    private String buildFormJson(OaOfficeSupplyRequest entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("requestNo", entity.getRequestNo());
        data.put("requireDate", entity.getRequireDate());
        data.put("purpose", entity.getPurpose());
        data.put("itemCount", entity.getItemCount());
        data.put("totalQty", entity.getTotalQty());
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
