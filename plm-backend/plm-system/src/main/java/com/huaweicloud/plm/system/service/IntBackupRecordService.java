package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntBackupRecordQuery;
import com.huaweicloud.plm.system.dto.IntBackupRecordSaveRequest;
import com.huaweicloud.plm.system.entity.IntBackupRecord;
import com.huaweicloud.plm.system.mapper.IntBackupRecordMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 备份恢复记录服务（N9，DEV-103）。 */
@Service
@RequiredArgsConstructor
public class IntBackupRecordService {

    private static final String DEFAULT_RECORD_TYPE = "BACKUP";
    private static final String DEFAULT_SCOPE = "DB";
    private static final String DEFAULT_RESULT_STATUS = "SUCCESS";
    private static final String NO_PREFIX = "BKP";

    private final IntBackupRecordMapper intBackupRecordMapper;
    private final IntSupportService intSupport;

    /** 分页查询备份恢复记录。 */
    public PageResult<IntBackupRecord> page(IntBackupRecordQuery query) {
        Page<IntBackupRecord> page = query.toPage();
        intBackupRecordMapper.selectPage(page, Wrappers.<IntBackupRecord>lambdaQuery()
                .eq(StringUtils.hasText(query.getRecordNo()), IntBackupRecord::getRecordNo, query.getRecordNo())
                .eq(StringUtils.hasText(query.getRecordType()), IntBackupRecord::getRecordType, query.getRecordType())
                .eq(StringUtils.hasText(query.getScope()), IntBackupRecord::getScope, query.getScope())
                .eq(StringUtils.hasText(query.getResultStatus()), IntBackupRecord::getResultStatus, query.getResultStatus())
                .eq(query.getVerified() != null, IntBackupRecord::getVerified, query.getVerified())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntBackupRecord::getRecordNo, query.getKeyword()).or()
                        .like(IntBackupRecord::getTargetPath, query.getKeyword()))
                .orderByDesc(IntBackupRecord::getId));
        return PageResult.of(page);
    }

    /** 按编号获取备份恢复记录，不存在则抛出业务异常。 */
    public IntBackupRecord require(String recordNo) {
        IntBackupRecord record = intBackupRecordMapper.selectOne(Wrappers.<IntBackupRecord>lambdaQuery()
                .eq(IntBackupRecord::getRecordNo, recordNo)
                .last("LIMIT 1"));
        if (record == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "备份恢复记录不存在: " + recordNo);
        }
        return record;
    }

    /** 创建备份恢复记录，返回记录编号。 */
    public String create(IntBackupRecordSaveRequest request) {
        IntBackupRecord record = new IntBackupRecord();
        record.setRecordNo(StringUtils.hasText(request.getRecordNo())
                ? request.getRecordNo() : intSupport.nextNo(NO_PREFIX));
        record.setRecordType(StringUtils.hasText(request.getRecordType())
                ? request.getRecordType() : DEFAULT_RECORD_TYPE);
        record.setScope(StringUtils.hasText(request.getScope())
                ? request.getScope() : DEFAULT_SCOPE);
        record.setBackupAt(request.getBackupAt() == null ? LocalDateTime.now() : request.getBackupAt());
        record.setSizeMb(request.getSizeMb());
        record.setTargetPath(request.getTargetPath());
        record.setRpoMinutes(request.getRpoMinutes());
        record.setRtoMinutes(request.getRtoMinutes());
        record.setElapsedMinutes(request.getElapsedMinutes());
        record.setResultStatus(StringUtils.hasText(request.getResultStatus())
                ? request.getResultStatus() : DEFAULT_RESULT_STATUS);
        record.setVerified(request.getVerified() == null ? 0 : request.getVerified());
        record.setOperator(StringUtils.hasText(request.getOperator())
                ? request.getOperator() : UserContext.getUsername());
        record.setRemark(request.getRemark());
        intBackupRecordMapper.insert(record);
        return record.getRecordNo();
    }

    /** 更新备份恢复记录。 */
    public void update(String recordNo, IntBackupRecordSaveRequest request) {
        IntBackupRecord record = require(recordNo);
        if (StringUtils.hasText(request.getRecordNo())) {
            record.setRecordNo(request.getRecordNo());
        }
        record.setRecordType(request.getRecordType());
        if (StringUtils.hasText(request.getScope())) {
            record.setScope(request.getScope());
        }
        if (request.getBackupAt() != null) {
            record.setBackupAt(request.getBackupAt());
        }
        record.setSizeMb(request.getSizeMb());
        record.setTargetPath(request.getTargetPath());
        record.setRpoMinutes(request.getRpoMinutes());
        record.setRtoMinutes(request.getRtoMinutes());
        record.setElapsedMinutes(request.getElapsedMinutes());
        if (StringUtils.hasText(request.getResultStatus())) {
            record.setResultStatus(request.getResultStatus());
        }
        if (request.getVerified() != null) {
            record.setVerified(request.getVerified());
        }
        if (StringUtils.hasText(request.getOperator())) {
            record.setOperator(request.getOperator());
        }
        record.setRemark(request.getRemark());
        intBackupRecordMapper.updateById(record);
    }

    /** 删除备份恢复记录。 */
    public void delete(String recordNo) {
        IntBackupRecord record = require(recordNo);
        intBackupRecordMapper.deleteById(record.getId());
    }

    /** 标记备份恢复记录已验证，返回更新后的实体。 */
    public IntBackupRecord verify(String recordNo) {
        IntBackupRecord record = require(recordNo);
        record.setVerified(1);
        intBackupRecordMapper.updateById(record);
        return record;
    }
}
