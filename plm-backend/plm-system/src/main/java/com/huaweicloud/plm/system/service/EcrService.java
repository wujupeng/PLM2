package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.EcoChangeItemSaveRequest;
import com.huaweicloud.plm.system.dto.EcrConvertRequest;
import com.huaweicloud.plm.system.dto.EcrDetailResponse;
import com.huaweicloud.plm.system.dto.EcrQuery;
import com.huaweicloud.plm.system.dto.EcrReviewRequest;
import com.huaweicloud.plm.system.dto.EcrSaveRequest;
import com.huaweicloud.plm.system.entity.EcoChangeItem;
import com.huaweicloud.plm.system.entity.EcoChangeOrder;
import com.huaweicloud.plm.system.entity.EcoChangeRequest;
import com.huaweicloud.plm.system.mapper.EcoChangeItemMapper;
import com.huaweicloud.plm.system.mapper.EcoChangeOrderMapper;
import com.huaweicloud.plm.system.mapper.EcoChangeRequestMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

/**
 * 工程变更申请（ECR）服务（DEV-039）：申请提交、评审与转 ECO。
 */
@Service
@RequiredArgsConstructor
public class EcrService {

    private static final DateTimeFormatter MONTH_FORMAT = DateTimeFormatter.ofPattern("yyyyMM");

    private static final String ECR_NO_CODE = "ECR";
    private static final String ECO_NO_CODE = "ECO";

    private static final String STATUS_DRAFT = "draft";
    private static final String STATUS_SUBMITTED = "submitted";
    private static final String STATUS_REVIEWING = "reviewing";
    private static final String STATUS_APPROVED = "approved";
    private static final String STATUS_REJECTED = "rejected";
    private static final String STATUS_CONVERTED = "converted";

    private static final String DECISION_APPROVED = "approved";

    private static final String CHANGE_ACTION_DEFAULT = "modify";
    private static final String SWITCH_STATUS_PENDING = "pending";

    private final EcoChangeRequestMapper changeRequestMapper;
    private final EcoChangeOrderMapper changeOrderMapper;
    private final EcoChangeItemMapper changeItemMapper;

    public PageResult<EcoChangeRequest> page(EcrQuery query) {
        Page<EcoChangeRequest> page = query.toPage();
        changeRequestMapper.selectPage(page, Wrappers.<EcoChangeRequest>lambdaQuery()
                .eq(StringUtils.hasText(query.getEcrNo()), EcoChangeRequest::getEcrNo, query.getEcrNo())
                .eq(StringUtils.hasText(query.getStatus()), EcoChangeRequest::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getSourceType()), EcoChangeRequest::getSourceType, query.getSourceType())
                .eq(StringUtils.hasText(query.getRiskLevel()), EcoChangeRequest::getRiskLevel, query.getRiskLevel())
                .eq(StringUtils.hasText(query.getUrgency()), EcoChangeRequest::getUrgency, query.getUrgency())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(EcoChangeRequest::getEcrNo, query.getKeyword()).or()
                        .like(EcoChangeRequest::getTitle, query.getKeyword()))
                .orderByDesc(EcoChangeRequest::getCreatedAt));
        return PageResult.of(page);
    }

    public EcrDetailResponse detail(Long ecrId) {
        EcoChangeRequest changeRequest = requireRequest(ecrId);
        EcrDetailResponse response = new EcrDetailResponse();
        response.setChangeRequest(changeRequest);
        response.setOrders(changeOrderMapper.selectList(Wrappers.<EcoChangeOrder>lambdaQuery()
                .eq(EcoChangeOrder::getEcrId, ecrId)
                .orderByDesc(EcoChangeOrder::getCreatedAt)));
        return response;
    }

    @Transactional
    public Long create(EcrSaveRequest request) {
        EcoChangeRequest changeRequest = new EcoChangeRequest();
        changeRequest.setEcrNo(generateEcrNo());
        applyRequest(changeRequest, request);
        changeRequest.setStatus(STATUS_DRAFT);
        changeRequest.setApplicantId(UserContext.getUserId());
        changeRequest.setApplicantName(UserContext.getUsername());
        changeRequestMapper.insert(changeRequest);
        return changeRequest.getId();
    }

    @Transactional
    public void update(Long ecrId, EcrSaveRequest request) {
        EcoChangeRequest changeRequest = requireRequest(ecrId);
        applyRequest(changeRequest, request);
        changeRequestMapper.updateById(changeRequest);
    }

    @Transactional
    public void delete(Long ecrId) {
        requireRequest(ecrId);
        changeRequestMapper.deleteById(ecrId);
    }

    @Transactional
    public void submit(Long ecrId) {
        EcoChangeRequest changeRequest = requireRequest(ecrId);
        if (!STATUS_DRAFT.equalsIgnoreCase(changeRequest.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不允许提交");
        }
        changeRequest.setStatus(STATUS_SUBMITTED);
        changeRequestMapper.updateById(changeRequest);
    }

    @Transactional
    public void review(Long ecrId, EcrReviewRequest request) {
        EcoChangeRequest changeRequest = requireRequest(ecrId);
        String status = changeRequest.getStatus();
        if (!STATUS_SUBMITTED.equalsIgnoreCase(status) && !STATUS_REVIEWING.equalsIgnoreCase(status)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不允许评审");
        }
        changeRequest.setReviewerId(UserContext.getUserId());
        changeRequest.setReviewerName(UserContext.getUsername());
        changeRequest.setReviewComment(request.getComment());
        changeRequest.setReviewedAt(LocalDateTime.now());
        changeRequest.setStatus(DECISION_APPROVED.equalsIgnoreCase(request.getDecision())
                ? STATUS_APPROVED : STATUS_REJECTED);
        changeRequestMapper.updateById(changeRequest);
    }

    /** 变更申请转 ECO：创建变更单与变更明细，并把申请状态置为已转 ECO。 */
    @Transactional
    public Long convert(Long ecrId, EcrConvertRequest request) {
        EcoChangeRequest changeRequest = requireRequest(ecrId);
        if (!STATUS_APPROVED.equalsIgnoreCase(changeRequest.getStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "变更申请未批准，不能转 ECO");
        }
        if (request == null || CollectionUtils.isEmpty(request.getItems())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "缺少变更对象明细");
        }

        EcoChangeOrder order = new EcoChangeOrder();
        order.setEcoNo(generateEcoNo());
        order.setEcrId(changeRequest.getId());
        order.setEcrNo(changeRequest.getEcrNo());
        order.setTitle(changeRequest.getTitle());
        order.setChangeType(StringUtils.hasText(request.getChangeType())
                ? request.getChangeType() : CHANGE_ACTION_DEFAULT);
        order.setPlanDesc(request.getPlanDesc());
        order.setApprovalStatus(STATUS_DRAFT);
        order.setEffectiveDate(request.getEffectiveDate());
        order.setEffectiveBatch(request.getEffectiveBatch());
        order.setExecutionStatus(SWITCH_STATUS_PENDING);
        changeOrderMapper.insert(order);

        for (EcoChangeItemSaveRequest itemRequest : request.getItems()) {
            if (itemRequest == null || !StringUtils.hasText(itemRequest.getObjectType())
                    || !StringUtils.hasText(itemRequest.getObjectCode())) {
                throw new BusinessException(ResultCode.BAD_REQUEST, "变更对象类型与编码不能为空");
            }
            EcoChangeItem item = new EcoChangeItem();
            item.setEcoId(order.getId());
            item.setObjectType(itemRequest.getObjectType());
            item.setObjectCode(itemRequest.getObjectCode());
            item.setObjectName(itemRequest.getObjectName());
            item.setChangeAction(StringUtils.hasText(itemRequest.getChangeAction())
                    ? itemRequest.getChangeAction() : CHANGE_ACTION_DEFAULT);
            item.setBeforeVersion(itemRequest.getBeforeVersion());
            item.setAfterVersion(itemRequest.getAfterVersion());
            item.setSwitchStatus(SWITCH_STATUS_PENDING);
            item.setRemark(itemRequest.getRemark());
            changeItemMapper.insert(item);
        }

        changeRequest.setStatus(STATUS_CONVERTED);
        changeRequestMapper.updateById(changeRequest);
        return order.getId();
    }

    private void applyRequest(EcoChangeRequest changeRequest, EcrSaveRequest request) {
        changeRequest.setTitle(request.getTitle());
        if (StringUtils.hasText(request.getSourceType())) {
            changeRequest.setSourceType(request.getSourceType());
        }
        changeRequest.setSourceRef(request.getSourceRef());
        changeRequest.setReason(request.getReason());
        changeRequest.setRiskLevel(request.getRiskLevel());
        changeRequest.setUrgency(request.getUrgency());
        changeRequest.setAffectedProducts(request.getAffectedProducts());
        changeRequest.setAffectedMaterials(request.getAffectedMaterials());
        changeRequest.setAffectedDocuments(request.getAffectedDocuments());
        changeRequest.setAffectedProcesses(request.getAffectedProcesses());
        changeRequest.setRemark(request.getRemark());
    }

    /**
     * 生成 ECR 编号：ECR-{yyyyMM}-{4 位流水号}，流水号取同前缀已有记录数 + 1，重复则继续递增。
     */
    private String generateEcrNo() {
        String prefix = buildPrefix(ECR_NO_CODE);
        long seq = changeRequestMapper.selectCount(Wrappers.<EcoChangeRequest>lambdaQuery()
                .likeRight(EcoChangeRequest::getEcrNo, prefix)) + 1;
        String candidate = prefix + String.format("%04d", seq);
        while (changeRequestMapper.countByNo(candidate, -1L) > 0) {
            seq++;
            candidate = prefix + String.format("%04d", seq);
        }
        return candidate;
    }

    /**
     * 生成 ECO 编号：ECO-{yyyyMM}-{4 位流水号}，流水号取同前缀已有记录数 + 1，重复则继续递增。
     */
    private String generateEcoNo() {
        String prefix = buildPrefix(ECO_NO_CODE);
        long seq = changeOrderMapper.selectCount(Wrappers.<EcoChangeOrder>lambdaQuery()
                .likeRight(EcoChangeOrder::getEcoNo, prefix)) + 1;
        String candidate = prefix + String.format("%04d", seq);
        while (changeOrderMapper.selectCount(Wrappers.<EcoChangeOrder>lambdaQuery()
                .eq(EcoChangeOrder::getEcoNo, candidate)) > 0) {
            seq++;
            candidate = prefix + String.format("%04d", seq);
        }
        return candidate;
    }

    private String buildPrefix(String code) {
        return code + "-" + LocalDate.now().format(MONTH_FORMAT) + "-";
    }

    private EcoChangeRequest requireRequest(Long ecrId) {
        EcoChangeRequest changeRequest = changeRequestMapper.selectById(ecrId);
        if (changeRequest == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "变更申请不存在: " + ecrId);
        }
        return changeRequest;
    }
}
