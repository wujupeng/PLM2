package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsPickQuery;
import com.huaweicloud.plm.system.dto.WmsPickVerifyRequest;
import com.huaweicloud.plm.system.entity.WmsFifoRule;
import com.huaweicloud.plm.system.entity.WmsInventoryTxn;
import com.huaweicloud.plm.system.entity.WmsLineSideStock;
import com.huaweicloud.plm.system.entity.WmsMaterialBatch;
import com.huaweicloud.plm.system.entity.WmsMaterialBinding;
import com.huaweicloud.plm.system.entity.WmsPickRecord;
import com.huaweicloud.plm.system.mapper.WmsInventoryTxnMapper;
import com.huaweicloud.plm.system.mapper.WmsLineSideStockMapper;
import com.huaweicloud.plm.system.mapper.WmsMaterialBatchMapper;
import com.huaweicloud.plm.system.mapper.WmsPickRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * 扫码领料服务（N7，DEV-078/080）：工单/物料/批次/库位/数量/目标产线工位校验，
 * 集成 FIFO 规则引擎与防混料绑定校验，阻断或预警并留痕。
 */
@Service
@RequiredArgsConstructor
public class WmsPickService {

    private static final String RESULT_PASS = "PASS";
    private static final String RESULT_BLOCKED = "BLOCKED";
    private static final String RESULT_WARN = "WARN";
    private static final String FIFO_OK = "FIFO_OK";
    private static final String FIFO_VIOLATION = "FIFO_VIOLATION";
    private static final String FIFO_EXCEPTION = "FIFO_EXCEPTION";
    private static final String MIX_OK = "MIX_OK";
    private static final String MIX_VIOLATION = "MIX_VIOLATION";
    private static final String MODE_STRICT = "STRICT";

    private final WmsPickRecordMapper pickRecordMapper;
    private final WmsMaterialBatchMapper batchMapper;
    private final WmsLineSideStockMapper lineStockMapper;
    private final WmsInventoryTxnMapper inventoryTxnMapper;
    private final WmsMaterialBatchService batchService;
    private final WmsFifoRuleService fifoRuleService;
    private final WmsMaterialBindingService bindingService;
    private final WmsSupportService wmsSupport;

    public PageResult<WmsPickRecord> page(WmsPickQuery query) {
        Page<WmsPickRecord> page = query.toPage();
        pickRecordMapper.selectPage(page, Wrappers.<WmsPickRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsPickRecord::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsPickRecord::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsPickRecord::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getLineCode()), WmsPickRecord::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getScanResult()), WmsPickRecord::getScanResult, query.getScanResult())
                .eq(StringUtils.hasText(query.getFifoResult()), WmsPickRecord::getFifoResult, query.getFifoResult())
                .eq(StringUtils.hasText(query.getMixCheckResult()), WmsPickRecord::getMixCheckResult, query.getMixCheckResult())
                .eq(StringUtils.hasText(query.getOperatorName()), WmsPickRecord::getOperatorName, query.getOperatorName())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsPickRecord::getPickNo, query.getKeyword()).or()
                        .like(WmsPickRecord::getWorkOrderNo, query.getKeyword()).or()
                        .like(WmsPickRecord::getMaterialCode, query.getKeyword()))
                .orderByDesc(WmsPickRecord::getId));
        return PageResult.of(page);
    }

    public WmsPickRecord requirePick(String pickNo) {
        WmsPickRecord record = pickRecordMapper.selectOne(Wrappers.<WmsPickRecord>lambdaQuery()
                .eq(WmsPickRecord::getPickNo, pickNo));
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "领料记录不存在: " + pickNo);
        }
        return record;
    }

    /**
     * 扫码领料校验：先校验批次与 FIFO/超期，再校验防混料绑定，汇总为通过/预警/阻断，并留痕。
     * 通过或预警（含授权例外）时扣减批次库存、增加线边库存并写库存流水；阻断时不改变库存。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsPickRecord verify(WmsPickVerifyRequest request) {
        String operator = StringUtils.hasText(request.getOperatorName())
                ? request.getOperatorName() : UserContext.getUsername();
        BigDecimal qty = request.getQty() == null ? BigDecimal.ZERO : request.getQty();
        List<String> blockReasons = new ArrayList<>();
        List<String> warnReasons = new ArrayList<>();

        WmsPickRecord record = new WmsPickRecord();
        record.setPickNo(wmsSupport.nextNo("PICK"));
        record.setWorkOrderNo(request.getWorkOrderNo());
        record.setMaterialCode(request.getMaterialCode());
        record.setBatchNo(request.getBatchNo());
        record.setLocationCode(request.getLocationCode());
        record.setContainerCode(request.getContainerCode());
        record.setQty(qty);
        record.setUnit(request.getUnit());
        record.setLineCode(request.getLineCode());
        record.setWorkStation(request.getWorkStation());
        record.setOperatorName(operator);
        record.setRelatedDeliveryNo(request.getRelatedDeliveryNo());
        record.setPickAt(LocalDateTime.now());
        record.setRemark(request.getRemark());

        WmsMaterialBatch batch = batchService.findBatch(request.getMaterialCode(), request.getBatchNo(),
                request.getLocationCode());
        if (batch == null) {
            blockReasons.add("扫描的物料批次不存在或库位不匹配：" + request.getMaterialCode() + "/" + request.getBatchNo());
            record.setScanResult(RESULT_BLOCKED);
            record.setBlockReason(String.join("；", blockReasons));
            pickRecordMapper.insert(record);
            return record;
        }
        record.setMaterialName(batch.getMaterialName());
        if (!StringUtils.hasText(record.getUnit())) {
            record.setUnit(batch.getUnit());
        }

        // ---------- FIFO 校验 ----------
        WmsFifoRule rule = fifoRuleService.resolveRule(request.getMaterialCode(), null);
        String basis = rule != null && StringUtils.hasText(rule.getFifoBasis()) ? rule.getFifoBasis() : "INBOUND_DATE";
        List<WmsMaterialBatch> ordered = batchService.fifoOrder(request.getMaterialCode(), batch.getLocationCode());
        WmsMaterialBatch expected = ordered.isEmpty() ? null : ordered.get(0);
        boolean fifoViolation = false;
        if (expected != null && !expected.getBatchNo().equals(batch.getBatchNo())) {
            LocalDate expectedDate = basisDate(expected, basis);
            LocalDate scannedDate = basisDate(batch, basis);
            if (expectedDate != null && scannedDate != null && scannedDate.isAfter(expectedDate)) {
                fifoViolation = true;
                record.setExpectedBatchNo(expected.getBatchNo());
            }
        }
        if (rule != null) {
            record.setFifoRuleCode(rule.getRuleCode());
        }
        boolean exceptionAuthorized = Boolean.TRUE.equals(request.getAuthorizeException())
                && StringUtils.hasText(request.getAuthorizedBy());
        if (fifoViolation) {
            boolean allowed = rule == null || (rule.getAllowException() != null && rule.getAllowException() == 1);
            if (!allowed) {
                record.setFifoResult(FIFO_VIOLATION);
                blockReasons.add("违反先进先出且该物料不允许例外，应领用批次：" + expected.getBatchNo());
            } else if (exceptionAuthorized) {
                record.setFifoResult(FIFO_EXCEPTION);
                record.setExceptionAuthorized(1);
                record.setAuthorizedBy(request.getAuthorizedBy());
                record.setAuthorizeReason(request.getAuthorizeReason());
                warnReasons.add("违反先进先出，已由 " + request.getAuthorizedBy() + " 授权例外放行");
            } else {
                record.setFifoResult(FIFO_VIOLATION);
                blockReasons.add("违反先进先出且未授权，应领用批次：" + expected.getBatchNo());
            }
        } else {
            record.setFifoResult(FIFO_OK);
        }

        // ---------- 超期/临期校验 ----------
        LocalDate today = LocalDate.now();
        if (batch.getExpiryDate() != null) {
            boolean expiryCheck = rule == null || rule.getExpiryCheck() == null || rule.getExpiryCheck() == 1;
            if (expiryCheck) {
                if (batch.getExpiryDate().isBefore(today)) {
                    if (wmsSupport.configBool("wms.fifo.expiry_block", true)) {
                        blockReasons.add("批次已超期：" + batch.getBatchNo() + "（有效期至 " + batch.getExpiryDate() + "）");
                    } else {
                        warnReasons.add("批次已超期，按配置放行：" + batch.getBatchNo());
                    }
                } else {
                    int warnDays = rule != null && rule.getExpiryWarnDays() != null
                            ? rule.getExpiryWarnDays() : wmsSupport.configInt("wms.fifo.expiry_warn_days", 30);
                    if (batch.getExpiryDate().isBefore(today.plusDays(warnDays))) {
                        warnReasons.add("批次临近有效期：" + batch.getBatchNo() + "（有效期至 " + batch.getExpiryDate() + "）");
                    }
                }
            }
        }

        // ---------- 防混料校验 ----------
        boolean mixEnabled = wmsSupport.configBool("wms.mix.check.enabled", true);
        boolean strictMode = MODE_STRICT.equalsIgnoreCase(wmsSupport.config("wms.mix.check.mode", MODE_STRICT));
        if (mixEnabled) {
            List<WmsMaterialBinding> bindings = bindingService.listActiveByLine(request.getLineCode());
            boolean materialAllowed = bindings.isEmpty() || bindings.stream()
                    .anyMatch(binding -> request.getMaterialCode().equals(binding.getMaterialCode()));
            WmsMaterialBinding effective = bindingService.findEffective(request.getLineCode(),
                    request.getWorkStation(), request.getMaterialCode());
            boolean containerMismatch = effective != null
                    && StringUtils.hasText(effective.getContainerCode())
                    && StringUtils.hasText(request.getContainerCode())
                    && !effective.getContainerCode().equals(request.getContainerCode());
            if (!materialAllowed || containerMismatch) {
                record.setMixCheckResult(MIX_VIOLATION);
                if (effective != null) {
                    record.setBindingNo(effective.getBindingNo());
                }
                String reason = !materialAllowed
                        ? "物料与产线绑定不一致，产线 " + request.getLineCode() + " 不允许使用物料 " + request.getMaterialCode()
                        : "容器与工位绑定不一致，应为 " + effective.getContainerCode();
                if (strictMode) {
                    blockReasons.add("防混料校验不通过：" + reason);
                } else {
                    warnReasons.add("防混料校验预警放行：" + reason);
                }
            } else {
                record.setMixCheckResult(MIX_OK);
            }
        }

        // ---------- 汇总结果 ----------
        if (!blockReasons.isEmpty()) {
            record.setScanResult(RESULT_BLOCKED);
            record.setBlockReason(String.join("；", blockReasons));
            pickRecordMapper.insert(record);
            return record;
        }
        record.setScanResult(warnReasons.isEmpty() ? RESULT_PASS : RESULT_WARN);
        if (!warnReasons.isEmpty()) {
            record.setBlockReason(String.join("；", warnReasons));
        }
        pickRecordMapper.insert(record);

        // ---------- 库存扣减与线边入库 ----------
        applyStock(record, batch, qty);
        return record;
    }

    private void applyStock(WmsPickRecord record, WmsMaterialBatch batch, BigDecimal qty) {
        BigDecimal onHand = batch.getQtyOnHand() == null ? BigDecimal.ZERO : batch.getQtyOnHand();
        BigDecimal remain = onHand.subtract(qty);
        batch.setQtyOnHand(remain.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : remain);
        if (batch.getQtyOnHand().compareTo(BigDecimal.ZERO) == 0) {
            batch.setBatchStatus("CONSUMED");
        }
        batchMapper.updateById(batch);

        WmsLineSideStock stock = lineStockMapper.selectOne(Wrappers.<WmsLineSideStock>lambdaQuery()
                .eq(WmsLineSideStock::getLineCode, record.getLineCode())
                .eq(WmsLineSideStock::getWorkStation, record.getWorkStation() == null ? "" : record.getWorkStation())
                .eq(WmsLineSideStock::getMaterialCode, record.getMaterialCode())
                .eq(WmsLineSideStock::getBatchNo, record.getBatchNo() == null ? "" : record.getBatchNo()));
        if (stock == null) {
            stock = new WmsLineSideStock();
            stock.setLineCode(record.getLineCode());
            stock.setWorkStation(record.getWorkStation() == null ? "" : record.getWorkStation());
            stock.setMaterialCode(record.getMaterialCode());
            stock.setMaterialName(record.getMaterialName());
            stock.setBatchNo(record.getBatchNo() == null ? "" : record.getBatchNo());
            stock.setContainerCode(record.getContainerCode());
            stock.setUnit(record.getUnit());
            stock.setQtyOnHand(qty);
            stock.setQtyIssued(qty);
            stock.setQtyConsumed(BigDecimal.ZERO);
            stock.setQtyReturned(BigDecimal.ZERO);
            stock.setQtyScrapped(BigDecimal.ZERO);
            stock.setSafetyStock(wmsSupport.configDecimal("wms.shortage.safety.stock.default", BigDecimal.ZERO));
            stock.setStockStatus("NORMAL");
            lineStockMapper.insert(stock);
        } else {
            stock.setQtyOnHand(nvl(stock.getQtyOnHand()).add(qty));
            stock.setQtyIssued(nvl(stock.getQtyIssued()).add(qty));
            recalcStockStatus(stock);
            lineStockMapper.updateById(stock);
        }

        WmsInventoryTxn txn = new WmsInventoryTxn();
        txn.setTxnNo(wmsSupport.nextNo("TXN"));
        txn.setTxnType("ISSUE");
        txn.setMaterialCode(record.getMaterialCode());
        txn.setBatchNo(record.getBatchNo());
        txn.setFromLocationCode(record.getLocationCode());
        txn.setToLocationCode(record.getLineCode());
        txn.setQty(qty);
        txn.setUnit(record.getUnit());
        txn.setWorkOrderNo(record.getWorkOrderNo());
        txn.setLineCode(record.getLineCode());
        txn.setWorkStation(record.getWorkStation());
        txn.setRefNo(record.getPickNo());
        txn.setOperatorName(record.getOperatorName());
        txn.setTxnAt(LocalDateTime.now());
        inventoryTxnMapper.insert(txn);
    }

    private void recalcStockStatus(WmsLineSideStock stock) {
        BigDecimal onHand = nvl(stock.getQtyOnHand());
        BigDecimal safety = stock.getSafetyStock();
        if (onHand.compareTo(BigDecimal.ZERO) <= 0) {
            stock.setStockStatus("SHORTAGE");
        } else if (safety != null && safety.compareTo(BigDecimal.ZERO) > 0 && onHand.compareTo(safety) < 0) {
            stock.setStockStatus("WARNING");
        } else {
            stock.setStockStatus("NORMAL");
        }
    }

    private BigDecimal nvl(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private LocalDate basisDate(WmsMaterialBatch batch, String basis) {
        return switch (basis) {
            case "RELEASE_DATE" -> batch.getReleaseDate();
            case "BATCH_DATE", "PRODUCTION_DATE" -> batch.getProductionDate();
            default -> batch.getInboundDate();
        };
    }
}
