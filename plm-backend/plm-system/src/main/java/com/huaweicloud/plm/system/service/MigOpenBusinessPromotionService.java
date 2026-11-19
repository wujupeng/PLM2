package com.huaweicloud.plm.system.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpDeliveryOrderSaveRequest;
import com.huaweicloud.plm.system.dto.ErpFinancePayableSaveRequest;
import com.huaweicloud.plm.system.dto.ErpFinanceReceivableSaveRequest;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpGoodsReceiptSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceOrderSaveRequest;
import com.huaweicloud.plm.system.dto.ErpOutsourceSettlementSaveRequest;
import com.huaweicloud.plm.system.dto.ErpProductionOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpProductionOrderSaveRequest;
import com.huaweicloud.plm.system.dto.ErpPurchaseInspectionSaveRequest;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpPurchaseOrderSaveRequest;
import com.huaweicloud.plm.system.dto.ErpSalesOrderLineSaveRequest;
import com.huaweicloud.plm.system.dto.ErpSalesOrderSaveRequest;
import com.huaweicloud.plm.system.dto.MigOpenBusinessImportRecord;
import com.huaweicloud.plm.system.entity.MigOpenBusinessBatch;
import com.huaweicloud.plm.system.entity.MigOpenBusinessImportRow;
import com.huaweicloud.plm.system.mapper.MigOpenBusinessBatchMapper;
import com.huaweicloud.plm.system.mapper.MigOpenBusinessImportRowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/** 审核通过的暂存行经现有 ERP 业务服务创建正式单据。 */
@Service
@RequiredArgsConstructor
public class MigOpenBusinessPromotionService {

    private static final String APPROVED = "APPROVED";
    private static final String PROMOTION_FAILED = "PROMOTION_FAILED";
    private static final String PROMOTED = "PROMOTED";

    private final MigOpenBusinessImportService importService;
    private final MigOpenBusinessImportRowMapper rowMapper;
    private final MigOpenBusinessBatchMapper batchMapper;
    private final ObjectMapper objectMapper;
    private final ErpSalesOrderService salesOrderService;
    private final ErpPurchaseOrderService purchaseOrderService;
    private final ErpOutsourceOrderService outsourceOrderService;
    private final ErpProductionOrderService productionOrderService;
    private final ErpGoodsReceiptService goodsReceiptService;
    private final ErpDeliveryOrderService deliveryOrderService;
    private final ErpPurchaseInspectionService purchaseInspectionService;
    private final ErpFinanceReceivableService receivableService;
    private final ErpFinancePayableService payableService;
    private final ErpOutsourceSettlementService outsourceSettlementService;
    private final PlatformTransactionManager transactionManager;

    public MigOpenBusinessImportRow promote(Long rowId) {
        try {
            return new TransactionTemplate(transactionManager).execute(status -> promoteInTransaction(rowId));
        } catch (BusinessException | DataIntegrityViolationException ex) {
            recordPromotionFailure(rowId, ex);
            throw ex;
        }
    }

    private MigOpenBusinessImportRow promoteInTransaction(Long rowId) {
        MigOpenBusinessImportRow row = rowMapper.selectForUpdate(rowId);
        if (row == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移暂存行不存在: " + rowId);
        }
        if (!APPROVED.equals(row.getRowStatus()) && !PROMOTION_FAILED.equals(row.getRowStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审核通过的暂存行可以转入正式业务");
        }
        MigOpenBusinessBatch batch = batchMapper.selectById(row.getBatchId());
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "未结业务迁移批次不存在: " + row.getBatchId());
        }

        JsonNode payload = readPayload(row.getSourcePayload());
        MigOpenBusinessImportRecord record = new MigOpenBusinessImportRecord();
        record.setSourceNo(row.getSourceNo());
        record.setObjectType(row.getObjectType());
        record.setPayload(payload);
        List<String> errors = importService.validateRecord(batch, record);
        if (!errors.isEmpty()) {
            throw new BusinessException(ResultCode.BAD_REQUEST, String.join("；", errors));
        }

        JsonNode header = payload.get("header");
        Long targetId = switch (row.getObjectType()) {
            case "OPEN_SALES_ORDER" -> createSalesOrder(header, payload.path("lines"));
            case "OPEN_PURCHASE_ORDER" -> createPurchaseOrder(header, payload.path("lines"));
            case "OUTSOURCE_ORDER" -> createOutsourceOrder(header, payload.path("lines"));
            case "PRODUCTION_ORDER" -> createProductionOrder(header, payload.path("lines"));
            case "IN_TRANSIT_PURCHASE" -> createGoodsReceipt(header, payload.path("lines"));
            case "IN_TRANSIT_SALES" -> createDelivery(header, payload.path("lines"));
            case "PENDING_INSPECTION" -> purchaseInspectionService.save(
                    null, convert(header, ErpPurchaseInspectionSaveRequest.class));
            case "UNSETTLED_AR" -> receivableService.save(
                    null, convert(header, ErpFinanceReceivableSaveRequest.class));
            case "UNSETTLED_AP" -> payableService.save(
                    null, convert(header, ErpFinancePayableSaveRequest.class));
            case "UNSETTLED_OUTSOURCE" -> outsourceSettlementService.save(
                    null, convert(header, ErpOutsourceSettlementSaveRequest.class));
            default -> throw new BusinessException(ResultCode.BAD_REQUEST,
                    "不支持的迁移对象类型: " + row.getObjectType());
        };

        row.setTargetId(targetId);
        row.setRowStatus(PROMOTED);
        row.setPromotedAt(LocalDateTime.now());
        row.setValidationMessage(null);
        rowMapper.updateById(row);
        importService.refreshBatch(row.getBatchId());
        return row;
    }

    private void recordPromotionFailure(Long rowId, RuntimeException exception) {
        MigOpenBusinessImportRow row = rowMapper.selectById(rowId);
        if (row == null || (!APPROVED.equals(row.getRowStatus())
                && !PROMOTION_FAILED.equals(row.getRowStatus()))) {
            return;
        }
        row.setRowStatus(PROMOTION_FAILED);
        String message = exception instanceof BusinessException
                ? exception.getMessage()
                : "目标业务数据冲突，检查单据编号及关联数据后可重试";
        row.setValidationMessage(message.length() > 2000 ? message.substring(0, 2000) : message);
        rowMapper.updateById(row);
        importService.refreshBatch(row.getBatchId());
    }

    private Long createSalesOrder(JsonNode header, JsonNode lines) {
        Long id = salesOrderService.create(convert(header, ErpSalesOrderSaveRequest.class));
        for (ErpSalesOrderLineSaveRequest line : convertLines(lines, ErpSalesOrderLineSaveRequest.class)) {
            salesOrderService.addLine(id, line);
        }
        return id;
    }

    private Long createPurchaseOrder(JsonNode header, JsonNode lines) {
        Long id = purchaseOrderService.create(convert(header, ErpPurchaseOrderSaveRequest.class));
        for (ErpPurchaseOrderLineSaveRequest line : convertLines(lines, ErpPurchaseOrderLineSaveRequest.class)) {
            purchaseOrderService.addLine(id, line);
        }
        return id;
    }

    private Long createOutsourceOrder(JsonNode header, JsonNode lines) {
        Long id = outsourceOrderService.create(convert(header, ErpOutsourceOrderSaveRequest.class));
        for (ErpOutsourceOrderLineSaveRequest line :
                convertLines(lines, ErpOutsourceOrderLineSaveRequest.class)) {
            outsourceOrderService.addLine(id, line);
        }
        return id;
    }

    private Long createProductionOrder(JsonNode header, JsonNode lines) {
        Long id = productionOrderService.create(convert(header, ErpProductionOrderSaveRequest.class));
        for (ErpProductionOrderLineSaveRequest line :
                convertLines(lines, ErpProductionOrderLineSaveRequest.class)) {
            productionOrderService.addLine(id, line);
        }
        return id;
    }

    private Long createGoodsReceipt(JsonNode header, JsonNode lines) {
        Long id = goodsReceiptService.create(convert(header, ErpGoodsReceiptSaveRequest.class));
        for (ErpGoodsReceiptLineSaveRequest line : convertLines(lines, ErpGoodsReceiptLineSaveRequest.class)) {
            goodsReceiptService.addLine(id, line);
        }
        return id;
    }

    private Long createDelivery(JsonNode header, JsonNode lines) {
        Long id = deliveryOrderService.create(convert(header, ErpDeliveryOrderSaveRequest.class));
        for (ErpDeliveryOrderLineSaveRequest line :
                convertLines(lines, ErpDeliveryOrderLineSaveRequest.class)) {
            deliveryOrderService.addLine(id, line);
        }
        return id;
    }

    private <T> T convert(JsonNode json, Class<T> type) {
        try {
            return objectMapper.treeToValue(json, type);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "迁移数据字段格式错误: " + ex.getOriginalMessage());
        }
    }

    private <T> List<T> convertLines(JsonNode lines, Class<T> type) {
        List<T> result = new ArrayList<>();
        for (JsonNode line : lines) {
            result.add(convert(line, type));
        }
        return result;
    }

    private JsonNode readPayload(String payload) {
        try {
            return objectMapper.readTree(payload);
        } catch (JsonProcessingException ex) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "暂存的来源数据不是有效 JSON");
        }
    }
}
