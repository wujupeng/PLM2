package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizChangeNoticeSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaBizChangeNotice;
import com.huaweicloud.plm.system.entity.OaBizChangeNoticeReceipt;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaBizChangeNoticeMapper;
import com.huaweicloud.plm.system.mapper.OaBizChangeNoticeReceiptMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 变更通知与图纸补发流程包（OA-DEV-076）：通知对象、版本、签收证据完整可追溯。
 */
@Service
@RequiredArgsConstructor
public class OaBizChangeNoticeService {

    public static final String PROCESS_CODE = "OA_CHANGE_NOTICE_FLOW";

    public static final String BIZ_TYPE = "BIZ_NOTICE";

    private static final String STATUS_DRAFT = "DRAFT";

    private static final String RECEIPT_PENDING = "PENDING";

    private static final String RECEIPT_RECEIVED = "RECEIVED";

    private final OaBizChangeNoticeMapper mapper;
    private final OaBizChangeNoticeReceiptMapper receiptMapper;
    private final OaBizFlowSupport flowSupport;
    private final ObjectMapper objectMapper;

    public PageResult<OaBizChangeNotice> page(OaBizFlowQuery query, Long applicantUserId) {
        Page<OaBizChangeNotice> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaBizChangeNotice>lambdaQuery()
                .eq(applicantUserId != null, OaBizChangeNotice::getPublisherUserId, applicantUserId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizChangeNotice::getFlowStatus, query.getFlowStatus())
                .eq(query.getOrgId() != null, OaBizChangeNotice::getOrgId, query.getOrgId())
                .eq(StringUtils.hasText(query.getTypeCode()), OaBizChangeNotice::getNoticeType, query.getTypeCode())
                .ge(StringUtils.hasText(query.getStartDate()), OaBizChangeNotice::getEffectiveDate,
                        OaBizFlowSupport.parseDate(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), OaBizChangeNotice::getEffectiveDate,
                        OaBizFlowSupport.parseDate(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaBizChangeNotice::getNoticeNo, query.getKeyword()).or()
                        .like(OaBizChangeNotice::getNoticeTitle, query.getKeyword()).or()
                        .like(OaBizChangeNotice::getMaterialCode, query.getKeyword()))
                .orderByDesc(OaBizChangeNotice::getId));
        return PageResult.of(page);
    }

    /** 我的待签收变更通知。 */
    public PageResult<OaBizChangeNotice> pageMyReceipt(OaBizFlowQuery query) {
        Long userId = UserContext.getUserId();
        Page<OaBizChangeNoticeReceipt> receiptPage = query.toPage();
        receiptMapper.selectPage(receiptPage, Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getReceiverUserId, userId)
                .eq(StringUtils.hasText(query.getFlowStatus()), OaBizChangeNoticeReceipt::getReceiptStatus, query.getFlowStatus())
                .orderByDesc(OaBizChangeNoticeReceipt::getId));
        List<Long> noticeIds = receiptPage.getRecords().stream()
                .map(OaBizChangeNoticeReceipt::getNoticeId).toList();
        PageResult<OaBizChangeNotice> result = new PageResult<>();
        result.setTotal(receiptPage.getTotal());
        result.setPageNum(receiptPage.getCurrent());
        result.setPageSize(receiptPage.getSize());
        if (noticeIds.isEmpty()) {
            result.setList(List.of());
            return result;
        }
        result.setList(mapper.selectList(Wrappers.<OaBizChangeNotice>lambdaQuery()
                .in(OaBizChangeNotice::getId, noticeIds)
                .orderByDesc(OaBizChangeNotice::getId)));
        return result;
    }

    /** 变更通知签收记录。 */
    public List<OaBizChangeNoticeReceipt> listReceipts(Long noticeId) {
        requireEntity(noticeId);
        return receiptMapper.selectList(Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getNoticeId, noticeId)
                .orderByAsc(OaBizChangeNoticeReceipt::getId));
    }

    public OaBizChangeNotice detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizChangeNoticeSaveRequest request) {
        OaBizChangeNotice entity;
        if (id == null) {
            entity = new OaBizChangeNotice();
            entity.setNoticeNo(flowSupport.nextBizNo("CN"));
            entity.setPublisherUserId(UserContext.getUserId());
            entity.setPublisherName(currentDisplayName());
            entity.setOrgId(currentOrgId());
            entity.setFlowStatus(STATUS_DRAFT);
            entity.setReceiptCount(0);
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
        saveReceipts(entity);
        if (Boolean.TRUE.equals(request.getSubmit())) {
            submit(entity.getId());
        }
        return entity.getId();
    }

    @Transactional
    public void submit(Long id) {
        OaBizChangeNotice entity = requireEntity(id);
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
        OaBizChangeNotice entity = requireEntity(id);
        if (!WorkflowEngineService.INSTANCE_RUNNING.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的单据可撤回");
        }
        flowSupport.cancelFlow(entity.getInstanceId());
        entity.setFlowStatus(WorkflowInstanceEvent.STATUS_CANCELLED);
        entity.setCancelFlag(1);
        mapper.updateById(entity);
    }

    /** 签收：当前用户签收变更通知，记录签收时间与备注。 */
    @Transactional
    public void sign(Long noticeId, String receiptRemark) {
        requireEntity(noticeId);
        Long userId = UserContext.getUserId();
        OaBizChangeNoticeReceipt receipt = receiptMapper.selectOne(Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getNoticeId, noticeId)
                .eq(OaBizChangeNoticeReceipt::getReceiverUserId, userId)
                .last("limit 1"));
        if (receipt == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "当前用户不在该变更通知的接收人范围内");
        }
        receipt.setReceiptStatus(RECEIPT_RECEIVED);
        receipt.setReceiptTime(LocalDateTime.now());
        receipt.setReceiptRemark(receiptRemark);
        receiptMapper.updateById(receipt);
        refreshReceiptCount(noticeId);
    }

    @Transactional
    public void delete(Long id) {
        OaBizChangeNotice entity = requireEntity(id);
        if (!STATUS_DRAFT.equals(entity.getFlowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅草稿状态的单据可删除");
        }
        receiptMapper.delete(Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getNoticeId, id));
        mapper.deleteById(id);
    }

    public OaBizChangeNotice requireEntity(Long id) {
        OaBizChangeNotice entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更通知单不存在: " + id);
        }
        return entity;
    }

    @Transactional
    public void markFlowStatus(Long id, String flowStatus) {
        OaBizChangeNotice entity = mapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setFlowStatus(flowStatus);
        mapper.updateById(entity);
    }

    private void saveReceipts(OaBizChangeNotice entity) {
        receiptMapper.delete(Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getNoticeId, entity.getId()));
        entity.setReceiptCount(0);
        int need = entity.getNeedReceipt() == null ? 1 : entity.getNeedReceipt();
        if (need != 1 || !StringUtils.hasText(entity.getReceiverUserIds())) {
            mapper.updateById(entity);
            return;
        }
        String[] ids = entity.getReceiverUserIds().split(",");
        String[] names = StringUtils.hasText(entity.getReceiverNames())
                ? entity.getReceiverNames().split(",") : new String[0];
        for (int i = 0; i < ids.length; i++) {
            String idText = ids[i].trim();
            if (!StringUtils.hasText(idText)) {
                continue;
            }
            OaBizChangeNoticeReceipt receipt = new OaBizChangeNoticeReceipt();
            receipt.setNoticeId(entity.getId());
            try {
                receipt.setReceiverUserId(Long.parseLong(idText));
            } catch (NumberFormatException e) {
                continue;
            }
            receipt.setReceiverName(i < names.length ? names[i].trim() : null);
            receipt.setReceiptStatus(RECEIPT_PENDING);
            receiptMapper.insert(receipt);
        }
        mapper.updateById(entity);
    }

    private void refreshReceiptCount(Long noticeId) {
        Long received = receiptMapper.selectCount(Wrappers.<OaBizChangeNoticeReceipt>lambdaQuery()
                .eq(OaBizChangeNoticeReceipt::getNoticeId, noticeId)
                .eq(OaBizChangeNoticeReceipt::getReceiptStatus, RECEIPT_RECEIVED));
        OaBizChangeNotice entity = mapper.selectById(noticeId);
        if (entity != null) {
            entity.setReceiptCount(received == null ? 0 : received.intValue());
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
            throw new BusinessException(ResultCode.CONFLICT, "审批中或已通过的变更通知不可修改");
        }
    }

    private void validate(BizChangeNoticeSaveRequest request) {
        if (!StringUtils.hasText(request.getNoticeTitle())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "通知标题不能为空");
        }
    }

    private void apply(OaBizChangeNotice entity, BizChangeNoticeSaveRequest request) {
        entity.setNoticeType(StringUtils.hasText(request.getNoticeType()) ? request.getNoticeType() : "NOTICE");
        entity.setChangeSource(StringUtils.hasText(request.getChangeSource()) ? request.getChangeSource() : "OA");
        entity.setSourceRefNo(request.getSourceRefNo());
        entity.setMaterialCode(request.getMaterialCode());
        entity.setMaterialName(request.getMaterialName());
        entity.setDocCode(request.getDocCode());
        entity.setDocName(request.getDocName());
        entity.setDocVersion(request.getDocVersion());
        entity.setNoticeTitle(request.getNoticeTitle());
        entity.setNoticeContent(request.getNoticeContent());
        entity.setEffectiveDate(request.getEffectiveDate());
        entity.setReceiverUserIds(request.getReceiverUserIds());
        entity.setReceiverNames(request.getReceiverNames());
        entity.setNeedReceipt(request.getNeedReceipt() == null ? 1 : request.getNeedReceipt());
        entity.setAttachmentJson(request.getAttachmentJson());
        entity.setRemark(request.getRemark());
    }

    private String buildTitle(OaBizChangeNotice entity) {
        return "变更通知-" + entity.getNoticeTitle() + "-" + entity.getNoticeNo();
    }

    private String buildFormJson(OaBizChangeNotice entity) {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("noticeNo", entity.getNoticeNo());
        data.put("noticeType", entity.getNoticeType());
        data.put("noticeTitle", entity.getNoticeTitle());
        data.put("materialCode", entity.getMaterialCode());
        data.put("docCode", entity.getDocCode());
        data.put("docVersion", entity.getDocVersion());
        data.put("receiverNames", entity.getReceiverNames());
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
