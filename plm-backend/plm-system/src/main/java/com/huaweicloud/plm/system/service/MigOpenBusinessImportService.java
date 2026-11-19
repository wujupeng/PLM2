package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.*;
import com.huaweicloud.plm.system.entity.MigOpenBusinessBatch;
import com.huaweicloud.plm.system.entity.MigOpenBusinessImportRow;
import com.huaweicloud.plm.system.mapper.MigOpenBusinessBatchMapper;
import com.huaweicloud.plm.system.mapper.MigOpenBusinessImportRowMapper;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/** JSON 行导入、质量检查、暂存审核及批次统计。 */
@Service
@RequiredArgsConstructor
public class MigOpenBusinessImportService {

    private static final int MAX_PAYLOAD_LENGTH = 1_000_000;
    private static final String PENDING_REVIEW = "PENDING_REVIEW";
    private static final String INVALID = "INVALID";
    private static final String APPROVED = "APPROVED";
    private static final String REJECTED = "REJECTED";
    private static final String PROMOTION_FAILED = "PROMOTION_FAILED";
    private static final String PROMOTED = "PROMOTED";

    private final MigOpenBusinessBatchMapper batchMapper;
    private final MigOpenBusinessImportRowMapper rowMapper;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    @Transactional(rollbackFor = Exception.class)
    public MigOpenBusinessImportResult stage(Long batchId, MigOpenBusinessImportRequest request) {
        MigOpenBusinessBatch batch = requireBatch(batchId);
        if ("SUCCESS".equals(batch.getBatchStatus()) || "RUNNING".equals(batch.getBatchStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "已完成或正在执行的批次不能继续导入");
        }

        MigOpenBusinessImportResult result = new MigOpenBusinessImportResult();
        result.setBatchId(batchId);
        result.setBatchNo(batch.getBatchNo());
        result.setTotalCount(request.getRecords().size());
        List<MigOpenBusinessImportResult.RowResult> rowResults = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (MigOpenBusinessImportRecord record : request.getRecords()) {
            MigOpenBusinessImportRow row = new MigOpenBusinessImportRow();
            row.setBatchId(batchId);
            row.setBatchNo(batch.getBatchNo());
            row.setSourceNo(record.getSourceNo().trim());
            row.setObjectType(record.getObjectType().trim());
            row.setSourceFile(request.getSourceFile());
            String sourcePayload = serialize(record.getPayload());
            boolean payloadTooLarge = sourcePayload.length() > MAX_PAYLOAD_LENGTH;
            row.setSourcePayload(payloadTooLarge
                    ? sourcePayload.substring(0, MAX_PAYLOAD_LENGTH) : sourcePayload);

            List<String> errors = validateRecord(batch, record);
            if (payloadTooLarge) {
                errors.add("单条来源数据超过1MB限制，暂存预览已截断");
            }
            String key = row.getObjectType() + "::" + row.getSourceNo();
            boolean duplicateInBatch = !seen.add(key)
                    || rowMapper.selectCount(Wrappers.<MigOpenBusinessImportRow>lambdaQuery()
                    .eq(MigOpenBusinessImportRow::getBatchId, batchId)
                    .eq(MigOpenBusinessImportRow::getObjectType, row.getObjectType())
                    .eq(MigOpenBusinessImportRow::getSourceNo, row.getSourceNo())) > 0;
            boolean duplicateMigration = rowMapper.selectCount(Wrappers.<MigOpenBusinessImportRow>lambdaQuery()
                    .ne(MigOpenBusinessImportRow::getBatchId, batchId)
                    .eq(MigOpenBusinessImportRow::getObjectType, row.getObjectType())
                    .eq(MigOpenBusinessImportRow::getSourceNo, row.getSourceNo())
                    .in(MigOpenBusinessImportRow::getRowStatus,
                            PENDING_REVIEW, APPROVED, PROMOTION_FAILED, PROMOTED)) > 0;
            if (duplicateInBatch) {
                errors.add("同一批次中来源单号重复");
            } else if (duplicateMigration) {
                errors.add("其他批次中已有待审核、待重试或已转入正式单据的同来源记录");
            }

            row.setRowStatus(errors.isEmpty() ? PENDING_REVIEW : INVALID);
            String validationMessage = errors.isEmpty() ? null : String.join("；", errors);
            row.setValidationMessage(validationMessage == null || validationMessage.length() <= 2000
                    ? validationMessage : validationMessage.substring(0, 2000));
            rowMapper.insert(row);

            MigOpenBusinessImportResult.RowResult rowResult = new MigOpenBusinessImportResult.RowResult();
            rowResult.setSourceNo(row.getSourceNo());
            rowResult.setObjectType(row.getObjectType());
            rowResult.setRowStatus(row.getRowStatus());
            rowResult.setValidationMessage(row.getValidationMessage());
            rowResults.add(rowResult);
            if (errors.isEmpty()) {
                result.setValidCount(result.getValidCount() + 1);
            } else {
                result.setInvalidCount(result.getInvalidCount() + 1);
            }
        }

        result.setRows(rowResults);
        refreshBatch(batchId);
        return result;
    }

    public PageResult<MigOpenBusinessImportRow> page(Long batchId, MigOpenBusinessImportRowQuery query) {
        requireBatch(batchId);
        Page<MigOpenBusinessImportRow> page = query.toPage();
        rowMapper.selectPage(page, Wrappers.<MigOpenBusinessImportRow>lambdaQuery()
                .eq(MigOpenBusinessImportRow::getBatchId, batchId)
                .eq(StringUtils.hasText(query.getRowStatus()),
                        MigOpenBusinessImportRow::getRowStatus, query.getRowStatus())
                .eq(StringUtils.hasText(query.getObjectType()),
                        MigOpenBusinessImportRow::getObjectType, query.getObjectType())
                .orderByAsc(MigOpenBusinessImportRow::getId));
        return PageResult.of(page);
    }

    @Transactional(rollbackFor = Exception.class)
    public MigOpenBusinessImportRow review(Long id, MigOpenBusinessReviewRequest request) {
        MigOpenBusinessImportRow row = requireRow(id);
        boolean pendingReview = PENDING_REVIEW.equals(row.getRowStatus());
        boolean failedPromotionRejection = PROMOTION_FAILED.equals(row.getRowStatus())
                && Boolean.FALSE.equals(request.getApproved());
        if (!pendingReview && !failedPromotionRejection) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "仅待审核行可以通过审核；转入失败行只能驳回后在新批次重新导入");
        }
        row.setRowStatus(Boolean.TRUE.equals(request.getApproved()) ? APPROVED : REJECTED);
        row.setReviewedBy(UserContext.getUsername());
        row.setReviewedAt(java.time.LocalDateTime.now());
        row.setReviewComment(request.getComment());
        rowMapper.updateById(row);
        refreshBatch(row.getBatchId());
        return row;
    }

    public MigOpenBusinessImportRow requireRow(Long id) {
        MigOpenBusinessImportRow row = rowMapper.selectById(id);
        if (row == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移暂存行不存在: " + id);
        }
        return row;
    }

    public void refreshBatch(Long batchId) {
        MigOpenBusinessBatch batch = requireBatch(batchId);
        int total = Math.toIntExact(rowMapper.countByBatch(batchId));
        int promoted = Math.toIntExact(rowMapper.countByBatchAndStatus(batchId, PROMOTED));
        int failed = Math.toIntExact(rowMapper.countByBatchAndStatus(batchId, INVALID)
                + rowMapper.countByBatchAndStatus(batchId, REJECTED)
                + rowMapper.countByBatchAndStatus(batchId, PROMOTION_FAILED));
        int pendingCount = Math.toIntExact(rowMapper.countByBatchAndStatus(batchId, PENDING_REVIEW)
                + rowMapper.countByBatchAndStatus(batchId, APPROVED)
                + rowMapper.countByBatchAndStatus(batchId, PROMOTION_FAILED));
        boolean pending = pendingCount > 0;

        batch.setTotalCount(total);
        batch.setSuccessCount(promoted);
        batch.setFailCount(failed);
        batch.setBatchStatus(pending ? PENDING_REVIEW
                : promoted == total && total > 0 ? "SUCCESS"
                : promoted > 0 || failed > 0 ? "PARTIAL" : "PENDING");
        batch.setMessage("暂存 " + total + " 条；待审核/可重试 " + pendingCount
                + " 条；已转正式 " + promoted + " 条；失败/驳回 " + failed + " 条");
        if (pending && batch.getStartTime() == null) {
            batch.setStartTime(java.time.LocalDateTime.now());
        }
        if (pending) {
            batch.setEndTime(null);
        } else if (total > 0) {
            batch.setEndTime(java.time.LocalDateTime.now());
        }
        batchMapper.updateById(batch);
    }

    List<String> validateRecord(MigOpenBusinessBatch batch, MigOpenBusinessImportRecord record) {
        List<String> errors = new ArrayList<>();
        String type = record.getObjectType().trim();
        if (!supportsType(batch.getObjectType(), type)) {
            errors.add("对象类型与批次类型不匹配");
        }
        if (!StringUtils.hasText(record.getSourceNo())) {
            errors.add("来源单号不能为空");
        }
        JsonNode payload = record.getPayload();
        if (payload == null || !payload.isObject()) {
            errors.add("payload 必须为 JSON 对象");
            return errors;
        }
        JsonNode header = payload.get("header");
        if (header == null || !header.isObject()) {
            errors.add("payload.header 必须为单据头对象");
            return errors;
        }

        try {
            switch (type) {
                case "OPEN_SALES_ORDER" -> validate(header, ErpSalesOrderSaveRequest.class, errors);
                case "OPEN_PURCHASE_ORDER" -> validate(header, ErpPurchaseOrderSaveRequest.class, errors);
                case "OUTSOURCE_ORDER" -> validate(header, ErpOutsourceOrderSaveRequest.class, errors);
                case "PRODUCTION_ORDER" -> validate(header, ErpProductionOrderSaveRequest.class, errors);
                case "IN_TRANSIT_PURCHASE" -> validate(header, ErpGoodsReceiptSaveRequest.class, errors);
                case "IN_TRANSIT_SALES" -> validate(header, ErpDeliveryOrderSaveRequest.class, errors);
                case "PENDING_INSPECTION" -> validate(header, ErpPurchaseInspectionSaveRequest.class, errors);
                case "UNSETTLED_AR" -> validate(header, ErpFinanceReceivableSaveRequest.class, errors);
                case "UNSETTLED_AP" -> validate(header, ErpFinancePayableSaveRequest.class, errors);
                case "UNSETTLED_OUTSOURCE" -> validate(header, ErpOutsourceSettlementSaveRequest.class, errors);
                default -> errors.add("不支持的迁移对象类型: " + type);
            }
        } catch (IllegalArgumentException ex) {
            errors.add("单据头字段格式不正确: " + ex.getMessage());
        }

        if (requiresLines(type)) {
            JsonNode lines = payload.get("lines");
            if (lines == null || !lines.isArray() || lines.size() == 0) {
                errors.add("订单/到货/发运数据至少需要一条明细");
            } else {
                for (int i = 0; i < lines.size(); i++) {
                    validateLine(type, lines.get(i), i + 1, errors);
                }
            }
        }
        return errors;
    }

    private void validateLine(String type, JsonNode line, int index, List<String> errors) {
        if (line == null || !line.isObject()) {
            errors.add("第" + index + "条明细必须为 JSON 对象");
            return;
        }
        try {
            switch (type) {
                case "OPEN_SALES_ORDER" -> validate(line, ErpSalesOrderLineSaveRequest.class, errors, index);
                case "OPEN_PURCHASE_ORDER" -> validate(line, ErpPurchaseOrderLineSaveRequest.class, errors, index);
                case "OUTSOURCE_ORDER" -> validate(line, ErpOutsourceOrderLineSaveRequest.class, errors, index);
                case "PRODUCTION_ORDER" -> validate(line, ErpProductionOrderLineSaveRequest.class, errors, index);
                case "IN_TRANSIT_PURCHASE" -> validate(line, ErpGoodsReceiptLineSaveRequest.class, errors, index);
                case "IN_TRANSIT_SALES" -> validate(line, ErpDeliveryOrderLineSaveRequest.class, errors, index);
                default -> { }
            }
        } catch (IllegalArgumentException ex) {
            errors.add("第" + index + "条明细字段格式不正确: " + ex.getMessage());
        }
    }

    private <T> void validate(JsonNode json, Class<T> type, List<String> errors) {
        try {
            validate(objectMapper.treeToValue(json, type), errors, 0);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException(ex.getOriginalMessage(), ex);
        }
    }

    private <T> void validate(JsonNode json, Class<T> type, List<String> errors, int index) {
        try {
            validate(objectMapper.treeToValue(json, type), errors, index);
        } catch (JsonProcessingException ex) {
            throw new IllegalArgumentException(ex.getOriginalMessage(), ex);
        }
    }

    private <T> void validate(T value, List<String> errors, int index) {
        for (ConstraintViolation<T> violation : validator.validate(value)) {
            errors.add((index > 0 ? "第" + index + "条明细：" : "")
                    + violation.getMessage());
        }
    }

    static boolean requiresLines(String type) {
        return switch (type) {
            case "OPEN_SALES_ORDER", "OPEN_PURCHASE_ORDER", "OUTSOURCE_ORDER",
                    "PRODUCTION_ORDER", "IN_TRANSIT_PURCHASE", "IN_TRANSIT_SALES" -> true;
            default -> false;
        };
    }

    static boolean supportsType(String batchType, String recordType) {
        if (batchType == null) {
            return false;
        }
        if ("IN_TRANSIT".equals(batchType)) {
            return "IN_TRANSIT_PURCHASE".equals(recordType) || "IN_TRANSIT_SALES".equals(recordType);
        }
        if ("UNSETTLED".equals(batchType)) {
            return "UNSETTLED_AR".equals(recordType) || "UNSETTLED_AP".equals(recordType)
                    || "UNSETTLED_OUTSOURCE".equals(recordType);
        }
        return batchType.equals(recordType);
    }

    private MigOpenBusinessBatch requireBatch(Long batchId) {
        MigOpenBusinessBatch batch = batchMapper.selectById(batchId);
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "未结业务迁移批次不存在: " + batchId);
        }
        return batch;
    }

    private String serialize(JsonNode payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "来源业务数据无法序列化");
        }
    }
}
