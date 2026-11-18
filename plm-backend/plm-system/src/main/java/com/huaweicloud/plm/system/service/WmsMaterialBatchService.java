package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.WmsBatchQuery;
import com.huaweicloud.plm.system.dto.WmsBatchSaveRequest;
import com.huaweicloud.plm.system.entity.WmsFifoRule;
import com.huaweicloud.plm.system.entity.WmsMaterialBatch;
import com.huaweicloud.plm.system.mapper.WmsMaterialBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;

/**
 * 批次库存与物料标识服务（N7，DEV-075/079）。
 */
@Service
@RequiredArgsConstructor
public class WmsMaterialBatchService {

    private static final String DEFAULT_INSPECTION_STATUS = "RELEASED";
    private static final String DEFAULT_BATCH_STATUS = "IN_STOCK";
    private static final String BATCH_STATUS_IN_STOCK = "IN_STOCK";
    private static final String FIFO_BASIS_RELEASE_DATE = "RELEASE_DATE";
    private static final String FIFO_BASIS_BATCH_DATE = "BATCH_DATE";
    private static final String FIFO_BASIS_PRODUCTION_DATE = "PRODUCTION_DATE";
    private static final String FIFO_BASIS_INBOUND_DATE = "INBOUND_DATE";

    private final WmsMaterialBatchMapper wmsMaterialBatchMapper;
    private final WmsFifoRuleService wmsFifoRuleService;

    public PageResult<WmsMaterialBatch> page(WmsBatchQuery query) {
        Page<WmsMaterialBatch> page = query.toPage();
        wmsMaterialBatchMapper.selectPage(page, Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsMaterialBatch::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getBatchNo()), WmsMaterialBatch::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getLocationCode()), WmsMaterialBatch::getLocationCode, query.getLocationCode())
                .eq(StringUtils.hasText(query.getBatchStatus()), WmsMaterialBatch::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getInspectionStatus()), WmsMaterialBatch::getInspectionStatus, query.getInspectionStatus())
                .eq(StringUtils.hasText(query.getContainerCode()), WmsMaterialBatch::getContainerCode, query.getContainerCode())
                .eq(StringUtils.hasText(query.getSupplierCode()), WmsMaterialBatch::getSupplierCode, query.getSupplierCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsMaterialBatch::getBatchNo, query.getKeyword()).or()
                        .like(WmsMaterialBatch::getMaterialCode, query.getKeyword()).or()
                        .like(WmsMaterialBatch::getMaterialName, query.getKeyword()))
                .orderByAsc(WmsMaterialBatch::getMaterialCode)
                .orderByAsc(WmsMaterialBatch::getInboundDate)
                .orderByAsc(WmsMaterialBatch::getBatchNo));
        return PageResult.of(page);
    }

    public List<WmsMaterialBatch> listByMaterial(String materialCode) {
        return wmsMaterialBatchMapper.selectList(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(WmsMaterialBatch::getMaterialCode, materialCode)
                .orderByAsc(WmsMaterialBatch::getInboundDate));
    }

    /**
     * 返回指定物料在库批次，按有效 FIFO 规则的判定依据升序排序，空日期排最后。
     */
    public List<WmsMaterialBatch> fifoOrder(String materialCode, String locationCode) {
        List<WmsMaterialBatch> batches = wmsMaterialBatchMapper.selectList(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(WmsMaterialBatch::getMaterialCode, materialCode)
                .eq(WmsMaterialBatch::getBatchStatus, BATCH_STATUS_IN_STOCK)
                .eq(StringUtils.hasText(locationCode), WmsMaterialBatch::getLocationCode, locationCode));
        String basis = resolveFifoBasis(materialCode);
        Comparator<LocalDate> dateComparator = Comparator.nullsLast(Comparator.naturalOrder());
        Comparator<WmsMaterialBatch> comparator = Comparator.comparing(
                (WmsMaterialBatch batch) -> fifoDate(batch, basis), dateComparator);
        batches.sort(comparator);
        return batches;
    }

    public WmsMaterialBatch requireBatch(Long id) {
        WmsMaterialBatch batch = wmsMaterialBatchMapper.selectById(id);
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "物料批次不存在: " + id);
        }
        return batch;
    }

    public WmsMaterialBatch findBatch(String materialCode, String batchNo, String locationCode) {
        List<WmsMaterialBatch> batches = wmsMaterialBatchMapper.selectList(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(WmsMaterialBatch::getMaterialCode, materialCode)
                .eq(WmsMaterialBatch::getBatchNo, batchNo)
                .eq(StringUtils.hasText(locationCode), WmsMaterialBatch::getLocationCode, locationCode));
        return batches.isEmpty() ? null : batches.get(0);
    }

    public Long create(WmsBatchSaveRequest request) {
        ensureUnique(request.getMaterialCode(), request.getBatchNo(), request.getLocationCode(), -1L);
        WmsMaterialBatch batch = new WmsMaterialBatch();
        applyRequest(batch, request);
        wmsMaterialBatchMapper.insert(batch);
        return batch.getId();
    }

    public void update(Long id, WmsBatchSaveRequest request) {
        WmsMaterialBatch batch = requireBatch(id);
        ensureUnique(request.getMaterialCode(), request.getBatchNo(), request.getLocationCode(), id);
        applyRequest(batch, request);
        wmsMaterialBatchMapper.updateById(batch);
    }

    public void delete(Long id) {
        requireBatch(id);
        wmsMaterialBatchMapper.deleteById(id);
    }

    private void applyRequest(WmsMaterialBatch batch, WmsBatchSaveRequest request) {
        batch.setBatchNo(request.getBatchNo());
        batch.setMaterialCode(request.getMaterialCode());
        batch.setMaterialName(request.getMaterialName());
        batch.setLocationCode(request.getLocationCode());
        batch.setContainerCode(request.getContainerCode());
        batch.setSupplierCode(request.getSupplierCode());
        batch.setQtyOnHand(request.getQtyOnHand() != null ? request.getQtyOnHand() : BigDecimal.ZERO);
        batch.setUnit(request.getUnit());
        batch.setInboundDate(request.getInboundDate());
        batch.setReleaseDate(request.getReleaseDate());
        batch.setProductionDate(request.getProductionDate());
        batch.setExpiryDate(request.getExpiryDate());
        batch.setInspectionStatus(StringUtils.hasText(request.getInspectionStatus())
                ? request.getInspectionStatus() : DEFAULT_INSPECTION_STATUS);
        batch.setBatchStatus(StringUtils.hasText(request.getBatchStatus())
                ? request.getBatchStatus() : DEFAULT_BATCH_STATUS);
        batch.setWorkOrderNo(request.getWorkOrderNo());
        batch.setRemark(request.getRemark());
    }

    private void ensureUnique(String materialCode, String batchNo, String locationCode, Long excludeId) {
        long count = wmsMaterialBatchMapper.selectCount(Wrappers.<WmsMaterialBatch>lambdaQuery()
                .eq(WmsMaterialBatch::getMaterialCode, materialCode)
                .eq(WmsMaterialBatch::getBatchNo, batchNo)
                .eq(StringUtils.hasText(locationCode), WmsMaterialBatch::getLocationCode, locationCode)
                .ne(excludeId != null && excludeId > 0, WmsMaterialBatch::getId, excludeId));
        if (count > 0) {
            throw new BusinessException(ResultCode.CONFLICT,
                    "物料批次已存在: " + materialCode + "+" + batchNo + "+" + locationCode);
        }
    }

    /**
     * 解析有效 FIFO 规则依据字段，无有效规则时默认按入库日期。
     */
    private String resolveFifoBasis(String materialCode) {
        WmsFifoRule rule = wmsFifoRuleService.resolveRule(materialCode, null);
        if (rule == null || !StringUtils.hasText(rule.getFifoBasis())) {
            return FIFO_BASIS_INBOUND_DATE;
        }
        return rule.getFifoBasis();
    }

    private LocalDate fifoDate(WmsMaterialBatch batch, String basis) {
        return switch (basis) {
            case FIFO_BASIS_RELEASE_DATE -> batch.getReleaseDate();
            case FIFO_BASIS_BATCH_DATE, FIFO_BASIS_PRODUCTION_DATE -> batch.getProductionDate();
            default -> batch.getInboundDate();
        };
    }
}
