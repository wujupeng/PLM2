package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.system.dto.IntTrainingRecordQuery;
import com.huaweicloud.plm.system.dto.IntTrainingRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntTrainingRecord;
import com.huaweicloud.plm.system.mapper.IntTrainingRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

/** 培训记录服务（N9，DEV-104）。 */
@Service
@RequiredArgsConstructor
public class IntTrainingService {

    private static final String NO_PREFIX = "TRN";
    private static final int PASS_RATE_SCALE = 4;

    private final IntTrainingRecordMapper intTrainingRecordMapper;
    private final IntSupportService intSupport;

    /** 分页查询培训记录。 */
    public PageResult<IntTrainingRecord> page(IntTrainingRecordQuery query) {
        Page<IntTrainingRecord> page = query.toPage();
        intTrainingRecordMapper.selectPage(page, Wrappers.<IntTrainingRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getTrainingNo()), IntTrainingRecord::getTrainingNo, query.getTrainingNo())
                .eq(StringUtils.hasText(query.getRoleCode()), IntTrainingRecord::getRoleCode, query.getRoleCode())
                .eq(StringUtils.hasText(query.getTrainer()), IntTrainingRecord::getTrainer, query.getTrainer())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntTrainingRecord::getTrainingNo, query.getKeyword()).or()
                        .like(IntTrainingRecord::getTitle, query.getKeyword()).or()
                        .like(IntTrainingRecord::getTrainer, query.getKeyword()))
                .orderByDesc(IntTrainingRecord::getId));
        return PageResult.of(page);
    }

    /** 按编号获取培训记录，不存在则抛出业务异常。 */
    public IntTrainingRecord require(String trainingNo) {
        IntTrainingRecord record = intTrainingRecordMapper.selectOne(Wrappers.<IntTrainingRecord>lambdaQuery()
                .eq(IntTrainingRecord::getTrainingNo, trainingNo)
                .last("LIMIT 1"));
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "培训记录不存在: " + trainingNo);
        }
        return record;
    }

    /** 创建培训记录，返回培训编号。 */
    public String create(IntTrainingRecordSaveRequest request) {
        IntTrainingRecord record = new IntTrainingRecord();
        record.setTrainingNo(StringUtils.hasText(request.getTrainingNo())
                ? request.getTrainingNo() : intSupport.nextNo(NO_PREFIX));
        record.setRoleCode(request.getRoleCode());
        record.setTitle(request.getTitle());
        record.setTrainer(request.getTrainer());
        int traineeCount = request.getTraineeCount() == null ? 0 : request.getTraineeCount();
        int passedCount = request.getPassedCount() == null ? 0 : request.getPassedCount();
        record.setTraineeCount(traineeCount);
        record.setPassedCount(passedCount);
        record.setPassRate(calcPassRate(passedCount, traineeCount));
        record.setTrainedAt(request.getTrainedAt() == null ? LocalDateTime.now() : request.getTrainedAt());
        record.setMaterialUrl(request.getMaterialUrl());
        record.setRemark(request.getRemark());
        intTrainingRecordMapper.insert(record);
        return record.getTrainingNo();
    }

    /** 更新培训记录。 */
    public void update(String trainingNo, IntTrainingRecordSaveRequest request) {
        IntTrainingRecord record = require(trainingNo);
        if (StringUtils.hasText(request.getTrainingNo())) {
            record.setTrainingNo(request.getTrainingNo());
        }
        record.setRoleCode(request.getRoleCode());
        record.setTitle(request.getTitle());
        record.setTrainer(request.getTrainer());
        int traineeCount = request.getTraineeCount() == null
                ? (record.getTraineeCount() == null ? 0 : record.getTraineeCount()) : request.getTraineeCount();
        int passedCount = request.getPassedCount() == null
                ? (record.getPassedCount() == null ? 0 : record.getPassedCount()) : request.getPassedCount();
        record.setTraineeCount(traineeCount);
        record.setPassedCount(passedCount);
        record.setPassRate(calcPassRate(passedCount, traineeCount));
        if (request.getTrainedAt() != null) {
            record.setTrainedAt(request.getTrainedAt());
        }
        record.setMaterialUrl(request.getMaterialUrl());
        record.setRemark(request.getRemark());
        intTrainingRecordMapper.updateById(record);
    }

    /** 删除培训记录。 */
    public void delete(String trainingNo) {
        IntTrainingRecord record = require(trainingNo);
        intTrainingRecordMapper.deleteById(record.getId());
    }

    /** 计算通过率：参训人数小于等于 0 时返回 null，否则保留 4 位小数。 */
    private BigDecimal calcPassRate(int passedCount, int traineeCount) {
        if (traineeCount <= 0) {
            return null;
        }
        return BigDecimal.valueOf(passedCount)
                .divide(BigDecimal.valueOf(traineeCount), PASS_RATE_SCALE, RoundingMode.HALF_UP);
    }
}
