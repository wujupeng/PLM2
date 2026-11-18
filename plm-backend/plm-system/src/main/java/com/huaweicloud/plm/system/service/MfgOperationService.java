package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.MfgOperationQuery;
import com.huaweicloud.plm.system.dto.MfgOperationSaveRequest;
import com.huaweicloud.plm.system.entity.MfgOperationRecord;
import com.huaweicloud.plm.system.mapper.MfgOperationRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 工序过站与采集服务（N8，DEV-086）：对接 MES 采集工序、设备、工位、人员、时间与结果。
 */
@Service
@RequiredArgsConstructor
public class MfgOperationService {

    private static final String DEFAULT_RESULT = "OK";
    private static final String DEFAULT_INTERFACE_STATUS = "RECEIVED";
    private static final String SOURCE_MES = "MES";

    private final MfgOperationRecordMapper mfgOperationRecordMapper;
    private final MfgSupportService mfgSupport;

    public PageResult<MfgOperationRecord> page(MfgOperationQuery query) {
        Page<MfgOperationRecord> page = query.toPage();
        mfgOperationRecordMapper.selectPage(page, Wrappers.<MfgOperationRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordNo()), MfgOperationRecord::getRecordNo, query.getRecordNo())
                .eq(StringUtils.hasText(query.getBatchNo()), MfgOperationRecord::getBatchNo, query.getBatchNo())
                .eq(StringUtils.hasText(query.getSerialNo()), MfgOperationRecord::getSerialNo, query.getSerialNo())
                .eq(StringUtils.hasText(query.getOperationCode()), MfgOperationRecord::getOperationCode, query.getOperationCode())
                .eq(StringUtils.hasText(query.getWorkStation()), MfgOperationRecord::getWorkStation, query.getWorkStation())
                .eq(StringUtils.hasText(query.getResult()), MfgOperationRecord::getResult, query.getResult())
                .eq(StringUtils.hasText(query.getInterfaceStatus()), MfgOperationRecord::getInterfaceStatus, query.getInterfaceStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(MfgOperationRecord::getRecordNo, query.getKeyword()).or()
                        .like(MfgOperationRecord::getBatchNo, query.getKeyword()).or()
                        .like(MfgOperationRecord::getSerialNo, query.getKeyword()).or()
                        .like(MfgOperationRecord::getOperationName, query.getKeyword()))
                .orderByDesc(MfgOperationRecord::getId));
        return PageResult.of(page);
    }

    public List<MfgOperationRecord> listByBatch(String batchNo) {
        return mfgOperationRecordMapper.selectList(Wrappers.<MfgOperationRecord>lambdaQuery()
                .eq(MfgOperationRecord::getBatchNo, batchNo)
                .orderByAsc(MfgOperationRecord::getSeqNo)
                .orderByAsc(MfgOperationRecord::getId));
    }

    public MfgOperationRecord require(Long id) {
        MfgOperationRecord record = mfgOperationRecordMapper.selectById(id);
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "工序过站记录不存在: " + id);
        }
        return record;
    }

    public Long create(MfgOperationSaveRequest request) {
        String recordNo = StringUtils.hasText(request.getRecordNo())
                ? request.getRecordNo() : mfgSupport.nextNo("OP");
        MfgOperationRecord record = new MfgOperationRecord();
        record.setRecordNo(recordNo);
        applyFields(record, request);
        if (record.getCollectTime() == null) {
            record.setCollectTime(LocalDateTime.now());
        }
        mfgOperationRecordMapper.insert(record);
        return record.getId();
    }

    public void update(Long id, MfgOperationSaveRequest request) {
        MfgOperationRecord record = require(id);
        applyFields(record, request);
        mfgOperationRecordMapper.updateById(record);
    }

    public void delete(Long id) {
        require(id);
        mfgOperationRecordMapper.deleteById(id);
    }

    private void applyFields(MfgOperationRecord record, MfgOperationSaveRequest request) {
        record.setBatchNo(request.getBatchNo());
        record.setWorkOrderNo(request.getWorkOrderNo());
        record.setProductCode(request.getProductCode());
        record.setSerialNo(request.getSerialNo());
        record.setOperationCode(request.getOperationCode());
        record.setOperationName(request.getOperationName());
        record.setSeqNo(request.getSeqNo());
        record.setWorkStation(request.getWorkStation());
        record.setLineCode(request.getLineCode());
        record.setEquipmentCode(request.getEquipmentCode());
        record.setOperator(request.getOperator());
        record.setStartTime(request.getStartTime());
        record.setEndTime(request.getEndTime());
        record.setInQty(request.getInQty());
        record.setOutQty(request.getOutQty());
        record.setScrapQty(request.getScrapQty() != null ? request.getScrapQty() : BigDecimal.ZERO);
        record.setResult(StringUtils.hasText(request.getResult()) ? request.getResult() : DEFAULT_RESULT);
        record.setSourceSystem(StringUtils.hasText(request.getSourceSystem())
                ? request.getSourceSystem() : SOURCE_MES);
        record.setCollectTime(request.getCollectTime());
        record.setInterfaceStatus(StringUtils.hasText(request.getInterfaceStatus())
                ? request.getInterfaceStatus() : DEFAULT_INTERFACE_STATUS);
        record.setRemark(request.getRemark());
    }
}
