package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgBatchQuery;
import com.huaweicloud.plm.system.dto.MfgBatchSaveRequest;
import com.huaweicloud.plm.system.entity.MfgProductionBatch;
import com.huaweicloud.plm.system.mapper.MfgProductionBatchMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

/**
 * 生产批次档案服务（N8，DEV-085）：关联工单、产品、BOM/工艺版本与生产现场信息。
 */
@Service
@RequiredArgsConstructor
public class MfgBatchService {

    private static final String DEFAULT_BATCH_STATUS = "PLANNED";
    private static final String DEFAULT_RELEASE_STATUS = "UNRELEASED";

    private final MfgProductionBatchMapper mfgProductionBatchMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgProductionBatch> page(MfgBatchQuery query) {
        Page<MfgProductionBatch> page = query.toPage();
        mfgProductionBatchMapper.selectPage(page, Wrappers.<MfgProductionBatch>lambdaQuery()
                .eq(StringUtils.hasText(query.getBatchNo()), MfgProductionBatch::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getWorkOrderNo()), MfgProductionBatch::getWorkOrderNo, query.getWorkOrderNo())
                .eq(StringUtils.hasText(query.getProductCode()), MfgProductionBatch::getProductCode, query.getProductCode())
                .eq(StringUtils.hasText(query.getLineCode()), MfgProductionBatch::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getBatchStatus()), MfgProductionBatch::getBatchStatus, query.getBatchStatus())
                .eq(StringUtils.hasText(query.getReleaseStatus()), MfgProductionBatch::getReleaseStatus, query.getReleaseStatus())
                .ge(query.getProductionDateFrom() != null, MfgProductionBatch::getProductionDate, query.getProductionDateFrom())
                .le(query.getProductionDateTo() != null, MfgProductionBatch::getProductionDate, query.getProductionDateTo())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgProductionBatch::getBatchNo, query.getKeyword()).or()
                        .like(MfgProductionBatch::getWorkOrderNo, query.getKeyword()).or()
                        .like(MfgProductionBatch::getProductCode, query.getKeyword()).or()
                        .like(MfgProductionBatch::getProductName, query.getKeyword()))
                .orderByDesc(MfgProductionBatch::getId));
        return PageResult.of(page);
    }

    public MfgProductionBatch requireBatch(String batchNo) {
        MfgProductionBatch batch = mfgProductionBatchMapper.selectOne(Wrappers.<MfgProductionBatch>lambdaQuery()
                .eq(MfgProductionBatch::getBatchNo, batchNo));
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产批次不存在: " + batchNo);
        }
        return batch;
    }

    public MfgProductionBatch requireById(Long id) {
        MfgProductionBatch batch = mfgProductionBatchMapper.selectById(id);
        if (batch == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "生产批次不存在: " + id);
        }
        return batch;
    }

    public Long create(MfgBatchSaveRequest request) {
        String batchNo = StringUtils.hasText(request.getBatchNo())
                ? request.getBatchNo() : mfgSupport.nextNo("PB");
        if (mfgProductionBatchMapper.selectCount(Wrappers.<MfgProductionBatch>lambdaQuery()
                .eq(MfgProductionBatch::getBatchNo, batchNo)) > 0) {
            throw new BusinessException(ResultCode.CONFLICT, "生产批次号已存在: " + batchNo);
        }
        MfgProductionBatch batch = new MfgProductionBatch();
        batch.setBatchNo(batchNo);
        applyFields(batch, request);
        mfgProductionBatchMapper.insert(batch);
        return batch.getId();
    }

    public void update(String batchNo, MfgBatchSaveRequest request) {
        MfgProductionBatch batch = requireBatch(batchNo);
        applyFields(batch, request);
        mfgProductionBatchMapper.updateById(batch);
    }

    public void delete(String batchNo) {
        MfgProductionBatch batch = requireBatch(batchNo);
        mfgProductionBatchMapper.deleteById(batch.getId());
    }

    private void applyFields(MfgProductionBatch batch, MfgBatchSaveRequest request) {
        batch.setWorkOrderNo(request.getWorkOrderNo());
        batch.setProductCode(request.getProductCode());
        batch.setProductName(request.getProductName());
        batch.setProductVersion(request.getProductVersion());
        batch.setBomVersion(request.getBomVersion());
        batch.setProcessVersion(request.getProcessVersion());
        batch.setProductionDate(request.getProductionDate());
        batch.setShiftCode(request.getShiftCode());
        batch.setLineCode(request.getLineCode());
        batch.setWorkStation(request.getWorkStation());
        batch.setPlannedQty(request.getPlannedQty());
        batch.setCompletedQty(request.getCompletedQty() != null ? request.getCompletedQty() : BigDecimal.ZERO);
        batch.setScrapQty(request.getScrapQty() != null ? request.getScrapQty() : BigDecimal.ZERO);
        batch.setBatchStatus(StringUtils.hasText(request.getBatchStatus())
                ? request.getBatchStatus() : DEFAULT_BATCH_STATUS);
        batch.setReleaseStatus(StringUtils.hasText(request.getReleaseStatus())
                ? request.getReleaseStatus() : DEFAULT_RELEASE_STATUS);
        batch.setSourceSystem(request.getSourceSystem());
        batch.setRemark(request.getRemark());
    }
}
