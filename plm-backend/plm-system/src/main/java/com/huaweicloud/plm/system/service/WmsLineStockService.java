package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsInventoryTxnQuery;
import com.huaweicloud.plm.system.dto.WmsLineStockQuery;
import com.huaweicloud.plm.system.dto.WmsLineStockSaveRequest;
import com.huaweicloud.plm.system.dto.WmsLineStockTxnRequest;
import com.huaweicloud.plm.system.entity.WmsInventoryTxn;
import com.huaweicloud.plm.system.entity.WmsLineSideStock;
import com.huaweicloud.plm.system.mapper.WmsInventoryTxnMapper;
import com.huaweicloud.plm.system.mapper.WmsLineSideStockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 线边库存与库存流水服务（N7，DEV-081）。
 */
@Service
@RequiredArgsConstructor
public class WmsLineStockService {

    /** 库存状态：正常。 */
    private static final String STATUS_NORMAL = "NORMAL";
    /** 库存状态：预警。 */
    private static final String STATUS_WARNING = "WARNING";
    /** 库存状态：缺料。 */
    private static final String STATUS_SHORTAGE = "SHORTAGE";

    /** 默认库存状态。 */
    private static final String DEFAULT_STOCK_STATUS = STATUS_NORMAL;

    /** 流水类型：发料。 */
    private static final String TXN_ISSUE = "ISSUE";
    /** 流水类型：消耗。 */
    private static final String TXN_CONSUME = "CONSUME";
    /** 流水类型：退料。 */
    private static final String TXN_RETURN = "RETURN";
    /** 流水类型：报废。 */
    private static final String TXN_SCRAP = "SCRAP";
    /** 流水类型：盘点调整。 */
    private static final String TXN_COUNT_ADJUST = "COUNT_ADJUST";

    /** 预警阈值比例配置项：实际阈值 = 安全库存 × 比例，默认 1。 */
    private static final String WARNING_RATIO_KEY = "wms.line.stock.warning.ratio";
    /** 缺料安全库存默认值配置项：安全库存为空时采用，默认 0。 */
    private static final String SAFETY_STOCK_DEFAULT_KEY = "wms.shortage.safety.stock.default";

    private final WmsLineSideStockMapper wmsLineSideStockMapper;
    private final WmsInventoryTxnMapper wmsInventoryTxnMapper;
    private final WmsSupportService wmsSupport;

    public PageResult<WmsLineSideStock> page(WmsLineStockQuery query) {
        Page<WmsLineSideStock> page = query.toPage();
        wmsLineSideStockMapper.selectPage(page, Wrappers.<WmsLineSideStock>lambdaQuery()
                .eq(StringUtils.hasText(query.getLineCode()), WmsLineSideStock::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkStation()), WmsLineSideStock::getWorkStation, query.getWorkStation())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsLineSideStock::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsLineSideStock::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getStockStatus()), WmsLineSideStock::getStockStatus, query.getStockStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsLineSideStock::getMaterialCode, query.getKeyword()).or()
                        .like(WmsLineSideStock::getMaterialName, query.getKeyword()).or()
                        .like(WmsLineSideStock::getBatchNo, query.getKeyword()))
                .orderByAsc(WmsLineSideStock::getLineCode)
                .orderByAsc(WmsLineSideStock::getMaterialCode));
        return PageResult.of(page);
    }

    public List<WmsLineSideStock> listByLine(String lineCode) {
        return wmsLineSideStockMapper.selectList(Wrappers.<WmsLineSideStock>lambdaQuery()
                .eq(WmsLineSideStock::getLineCode, lineCode)
                .orderByAsc(WmsLineSideStock::getMaterialCode));
    }

    public WmsLineSideStock requireStock(Long id) {
        WmsLineSideStock stock = wmsLineSideStockMapper.selectById(id);
        if (stock == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "线边库存不存在: " + id);
        }
        return stock;
    }

    @Transactional(rollbackFor = Exception.class)
    public Long create(WmsLineStockSaveRequest request) {
        String workStation = normalizeKey(request.getWorkStation());
        String batchNo = normalizeKey(request.getBatchNo());
        ensureUnique(request.getLineCode(), workStation, request.getMaterialCode(), batchNo, null);

        WmsLineSideStock stock = new WmsLineSideStock();
        stock.setLineCode(request.getLineCode());
        stock.setWorkStation(workStation);
        stock.setMaterialCode(request.getMaterialCode());
        stock.setMaterialName(request.getMaterialName());
        stock.setBatchNo(batchNo);
        stock.setContainerCode(request.getContainerCode());
        stock.setUnit(request.getUnit());
        stock.setQtyOnHand(BigDecimal.ZERO);
        stock.setQtyIssued(BigDecimal.ZERO);
        stock.setQtyConsumed(BigDecimal.ZERO);
        stock.setQtyReturned(BigDecimal.ZERO);
        stock.setQtyScrapped(BigDecimal.ZERO);
        stock.setSafetyStock(request.getSafetyStock());
        stock.setStockStatus(StringUtils.hasText(request.getStockStatus())
                ? request.getStockStatus() : DEFAULT_STOCK_STATUS);
        stock.setRemark(request.getRemark());
        wmsLineSideStockMapper.insert(stock);
        return stock.getId();
    }

    @Transactional(rollbackFor = Exception.class)
    public void update(Long id, WmsLineStockSaveRequest request) {
        WmsLineSideStock stock = requireStock(id);
        String workStation = normalizeKey(request.getWorkStation());
        String batchNo = normalizeKey(request.getBatchNo());
        ensureUnique(request.getLineCode(), workStation, request.getMaterialCode(), batchNo, id);

        stock.setLineCode(request.getLineCode());
        stock.setWorkStation(workStation);
        stock.setMaterialCode(request.getMaterialCode());
        stock.setMaterialName(request.getMaterialName());
        stock.setBatchNo(batchNo);
        stock.setContainerCode(request.getContainerCode());
        stock.setUnit(request.getUnit());
        stock.setSafetyStock(request.getSafetyStock());
        if (StringUtils.hasText(request.getStockStatus())) {
            stock.setStockStatus(request.getStockStatus());
        }
        stock.setRemark(request.getRemark());
        wmsLineSideStockMapper.updateById(stock);
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireStock(id);
        wmsLineSideStockMapper.deleteById(id);
    }

    /**
     * 发料：累计发料与现有数量均增加，并写入 ISSUE 流水。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsLineSideStock issue(Long id, WmsLineStockTxnRequest request) {
        WmsLineSideStock stock = requireStock(id);
        BigDecimal qty = nz(request.getQty());
        stock.setQtyIssued(nz(stock.getQtyIssued()).add(qty));
        stock.setQtyOnHand(nz(stock.getQtyOnHand()).add(qty));
        if (StringUtils.hasText(request.getContainerCode())) {
            stock.setContainerCode(request.getContainerCode());
        }
        if (StringUtils.hasText(request.getBatchNo())) {
            stock.setBatchNo(request.getBatchNo());
        }
        recalcStatus(stock);
        wmsLineSideStockMapper.updateById(stock);
        writeTxn(TXN_ISSUE, stock, request, null, stock.getLineCode(), "发料");
        return stock;
    }

    /**
     * 消耗：累计消耗增加、现有数量减少，不足时抛业务异常，并写入 CONSUME 流水。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsLineSideStock consume(Long id, WmsLineStockTxnRequest request) {
        WmsLineSideStock stock = requireStock(id);
        BigDecimal qty = nz(request.getQty());
        BigDecimal onHand = nz(stock.getQtyOnHand());
        if (onHand.subtract(qty).compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "消耗数量超过线边库存");
        }
        stock.setQtyConsumed(nz(stock.getQtyConsumed()).add(qty));
        stock.setQtyOnHand(onHand.subtract(qty));
        recalcStatus(stock);
        wmsLineSideStockMapper.updateById(stock);
        writeTxn(TXN_CONSUME, stock, request, stock.getLineCode(), null, "消耗");
        return stock;
    }

    /**
     * 退料：累计退料增加、现有数量减少；不足时现有数量置 0 不抛错，并在流水备注中说明。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsLineSideStock returnStock(Long id, WmsLineStockTxnRequest request) {
        WmsLineSideStock stock = requireStock(id);
        BigDecimal qty = nz(request.getQty());
        BigDecimal onHand = nz(stock.getQtyOnHand());
        String remark = "退料";
        if (onHand.compareTo(qty) < 0) {
            remark = "退料（退料数量超过现有库存，现有数量已置 0）";
            stock.setQtyOnHand(BigDecimal.ZERO);
        } else {
            stock.setQtyOnHand(onHand.subtract(qty));
        }
        stock.setQtyReturned(nz(stock.getQtyReturned()).add(qty));
        recalcStatus(stock);
        wmsLineSideStockMapper.updateById(stock);
        writeTxn(TXN_RETURN, stock, request, stock.getLineCode(), null, remark);
        return stock;
    }

    /**
     * 报废：累计报废增加、现有数量减少；不足时现有数量置 0 不抛错。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsLineSideStock scrap(Long id, WmsLineStockTxnRequest request) {
        WmsLineSideStock stock = requireStock(id);
        BigDecimal qty = nz(request.getQty());
        BigDecimal onHand = nz(stock.getQtyOnHand());
        String remark = "报废";
        if (onHand.compareTo(qty) < 0) {
            remark = "报废（报废数量超过现有库存，现有数量已置 0）";
            stock.setQtyOnHand(BigDecimal.ZERO);
        } else {
            stock.setQtyOnHand(onHand.subtract(qty));
        }
        stock.setQtyScrapped(nz(stock.getQtyScrapped()).add(qty));
        recalcStatus(stock);
        wmsLineSideStockMapper.updateById(stock);
        writeTxn(TXN_SCRAP, stock, request, stock.getLineCode(), null, remark);
        return stock;
    }

    /**
     * 盘点调整：现有数量按请求数量增减（可正可负），结果为负时抛业务异常。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsLineSideStock adjust(Long id, WmsLineStockTxnRequest request) {
        WmsLineSideStock stock = requireStock(id);
        BigDecimal qty = nz(request.getQty());
        BigDecimal result = nz(stock.getQtyOnHand()).add(qty);
        if (result.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "盘点调整后数量不能为负");
        }
        stock.setQtyOnHand(result);
        recalcStatus(stock);
        wmsLineSideStockMapper.updateById(stock);
        writeTxn(TXN_COUNT_ADJUST, stock, request, null, null, "盘点调整");
        return stock;
    }

    public PageResult<WmsInventoryTxn> txnPage(WmsInventoryTxnQuery query) {
        Page<WmsInventoryTxn> page = query.toPage();
        wmsInventoryTxnMapper.selectPage(page, Wrappers.<WmsInventoryTxn>lambdaQuery()
                .eq(StringUtils.hasText(query.getTxnType()), WmsInventoryTxn::getTxnType, query.getTxnType())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsInventoryTxn::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsInventoryTxn::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getLineCode()), WmsInventoryTxn::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), WmsInventoryTxn::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getRefNo()), WmsInventoryTxn::getRefNo, query.getRefNo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsInventoryTxn::getTxnNo, query.getKeyword()).or()
                        .like(WmsInventoryTxn::getMaterialCode, query.getKeyword()))
                .orderByDesc(WmsInventoryTxn::getId));
        return PageResult.of(page);
    }

    /**
     * 重算库存状态。
     * <p>阈值说明：现有数量小于等于 0 判为缺料 SHORTAGE；否则当安全库存大于 0 且现有数量
     * 小于安全库存 × 预警比例时判为预警 WARNING；其余为 NORMAL。预警比例可通过配置项
     * {@code wms.line.stock.warning.ratio} 调整（默认 1），安全库存为空时的兜底默认值可通过配置项
     * {@code wms.shortage.safety.stock.default} 调整（默认 0，即不触发预警）。</p>
     */
    private void recalcStatus(WmsLineSideStock stock) {
        BigDecimal onHand = nz(stock.getQtyOnHand());
        if (onHand.compareTo(BigDecimal.ZERO) <= 0) {
            stock.setStockStatus(STATUS_SHORTAGE);
            return;
        }
        BigDecimal threshold = resolveSafetyThreshold(stock.getSafetyStock());
        if (threshold.compareTo(BigDecimal.ZERO) > 0 && onHand.compareTo(threshold) < 0) {
            stock.setStockStatus(STATUS_WARNING);
        } else {
            stock.setStockStatus(STATUS_NORMAL);
        }
    }

    private BigDecimal resolveSafetyThreshold(BigDecimal safetyStock) {
        BigDecimal base = (safetyStock != null && safetyStock.compareTo(BigDecimal.ZERO) > 0)
                ? safetyStock
                : wmsSupport.configDecimal(SAFETY_STOCK_DEFAULT_KEY, BigDecimal.ZERO);
        BigDecimal ratio = wmsSupport.configDecimal(WARNING_RATIO_KEY, BigDecimal.ONE);
        if (ratio == null || ratio.compareTo(BigDecimal.ZERO) <= 0) {
            ratio = BigDecimal.ONE;
        }
        return base.multiply(ratio);
    }

    /**
     * 写入一条库存流水。materialCode/lineCode/workStation/unit/batchNo 取自库存；
     * 请求中给了 refNo/containerCode/toLocationCode 时覆盖对应值；操作人为空时取当前登录用户。
     */
    private void writeTxn(String txnType, WmsLineSideStock stock, WmsLineStockTxnRequest request,
                          String fromLocationCode, String toLocationCode, String remark) {
        WmsInventoryTxn txn = new WmsInventoryTxn();
        txn.setTxnNo(wmsSupport.nextNo("TXN"));
        txn.setTxnType(txnType);
        txn.setMaterialCode(stock.getMaterialCode());
        txn.setBatchNo(StringUtils.hasText(request.getBatchNo()) ? request.getBatchNo() : stock.getBatchNo());
        txn.setFromLocationCode(fromLocationCode);
        txn.setToLocationCode(StringUtils.hasText(request.getToLocationCode())
                ? request.getToLocationCode() : toLocationCode);
        txn.setQty(nz(request.getQty()));
        txn.setUnit(stock.getUnit());
        txn.setWorkOrderNo(request.getWorkOrderNo());
        txn.setLineCode(stock.getLineCode());
        txn.setWorkStation(stock.getWorkStation());
        txn.setRefNo(request.getRefNo());
        txn.setOperatorName(StringUtils.hasText(request.getOperatorName())
                ? request.getOperatorName() : UserContext.getUsername());
        txn.setTxnAt(LocalDateTime.now());
        txn.setRemark(StringUtils.hasText(remark) ? remark : request.getRemark());
        wmsInventoryTxnMapper.insert(txn);
    }

    private void ensureUnique(String lineCode, String workStation, String materialCode, String batchNo, Long excludeId) {
        long count = wmsLineSideStockMapper.selectCount(Wrappers.<WmsLineSideStock>lambdaQuery()
                .eq(WmsLineSideStock::getLineCode, lineCode)
                .eq(WmsLineSideStock::getWorkStation, workStation)
                .eq(WmsLineSideStock::getMaterialCode, materialCode)
                .eq(WmsLineSideStock::getBatchNo, batchNo)
                .ne(excludeId != null && excludeId > 0, WmsLineSideStock::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "该产线/工位/物料/批次的线边库存已存在");
        }
    }

    /** 唯一键为空时统一按空串处理，与表默认值保持一致。 */
    private String normalizeKey(String value) {
        return StringUtils.hasText(value) ? value : "";
    }

    private BigDecimal nz(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }
}
