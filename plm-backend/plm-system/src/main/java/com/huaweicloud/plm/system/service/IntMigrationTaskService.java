package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntMigrationExceptionHandleRequest;
import com.huaweicloud.plm.system.dto.IntMigrationExceptionQuery;
import com.huaweicloud.plm.system.dto.IntMigrationTaskQuery;
import com.huaweicloud.plm.system.dto.IntMigrationTaskSaveRequest;
import com.huaweicloud.plm.system.entity.IntMigrationException;
import com.huaweicloud.plm.system.entity.IntMigrationTask;
import com.huaweicloud.plm.system.mapper.IntMigrationExceptionMapper;
import com.huaweicloud.plm.system.mapper.IntMigrationTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 数据迁移任务服务（N9，DEV-098）。 */
@Service
@RequiredArgsConstructor
public class IntMigrationTaskService {

    private final IntMigrationTaskMapper migrationTaskMapper;
    private final IntMigrationExceptionMapper migrationExceptionMapper;
    private final IntSupportService intSupport;

    /**
     * 分页查询迁移任务。
     */
    public PageResult<IntMigrationTask> page(IntMigrationTaskQuery query) {
        Page<IntMigrationTask> page = query.toPage();
        migrationTaskMapper.selectPage(page, Wrappers.<IntMigrationTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), IntMigrationTask::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getScope()), IntMigrationTask::getScope, query.getScope())
                .eq(StringUtils.hasText(query.getSourceSystem()),
                        IntMigrationTask::getSourceSystem, query.getSourceSystem())
                .eq(StringUtils.hasText(query.getTargetTable()),
                        IntMigrationTask::getTargetTable, query.getTargetTable())
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        IntMigrationTask::getTaskStatus, query.getTaskStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntMigrationTask::getTaskNo, query.getKeyword()).or()
                        .like(IntMigrationTask::getSourceSystem, query.getKeyword()).or()
                        .like(IntMigrationTask::getTargetTable, query.getKeyword()))
                .orderByDesc(IntMigrationTask::getId));
        return PageResult.of(page);
    }

    /**
     * 按任务编号获取迁移任务，不存在时抛出业务异常。
     */
    public IntMigrationTask require(String taskNo) {
        IntMigrationTask entity = migrationTaskMapper.selectOne(Wrappers.<IntMigrationTask>lambdaQuery()
                .eq(IntMigrationTask::getTaskNo, taskNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移任务不存在: " + taskNo);
        }
        return entity;
    }

    /**
     * 新增迁移任务，返回任务编号。
     */
    public String create(IntMigrationTaskSaveRequest request) {
        IntMigrationTask entity = new IntMigrationTask();
        entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                ? request.getTaskNo() : intSupport.nextNo("MIG"));
        entity.setScope(request.getScope());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setTargetTable(request.getTargetTable());
        entity.setSourceCount(request.getSourceCount() == null ? 0L : request.getSourceCount());
        entity.setFailCount(request.getFailCount() == null ? 0L : request.getFailCount());
        entity.setSkipCount(request.getSkipCount() == null ? 0L : request.getSkipCount());
        entity.setSuccessCount(0L);
        entity.setTaskStatus("PENDING");
        entity.setOperator(UserContext.getUsername());
        entity.setRemark(request.getRemark());
        migrationTaskMapper.insert(entity);
        return entity.getTaskNo();
    }

    /**
     * 更新迁移任务。
     */
    public void update(String taskNo, IntMigrationTaskSaveRequest request) {
        IntMigrationTask entity = require(taskNo);
        entity.setScope(request.getScope());
        entity.setSourceSystem(request.getSourceSystem());
        entity.setTargetTable(request.getTargetTable());
        entity.setSourceCount(request.getSourceCount() == null ? 0L : request.getSourceCount());
        entity.setFailCount(request.getFailCount() == null ? 0L : request.getFailCount());
        entity.setSkipCount(request.getSkipCount() == null ? 0L : request.getSkipCount());
        entity.setRemark(request.getRemark());
        migrationTaskMapper.updateById(entity);
    }

    /**
     * 删除迁移任务。
     */
    public void delete(String taskNo) {
        IntMigrationTask entity = require(taskNo);
        migrationTaskMapper.deleteById(entity.getId());
    }

    /**
     * 执行迁移任务：置为运行中并记录开始时间。
     */
    public IntMigrationTask run(String taskNo) {
        IntMigrationTask entity = require(taskNo);
        if ("SUCCESS".equals(entity.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "迁移任务已完成，无需重复执行: " + taskNo);
        }
        entity.setTaskStatus("RUNNING");
        if (entity.getStartedAt() == null) {
            entity.setStartedAt(LocalDateTime.now());
        }
        entity.setFinishedAt(null);
        migrationTaskMapper.updateById(entity);
        return entity;
    }

    /**
     * 迁移前后数量与关系核对，计算成功条数并判定任务状态。
     */
    public IntMigrationTask verify(String taskNo) {
        IntMigrationTask entity = require(taskNo);
        long sourceCount = entity.getSourceCount() == null ? 0L : entity.getSourceCount();
        long failCount = entity.getFailCount() == null ? 0L : entity.getFailCount();
        long skipCount = entity.getSkipCount() == null ? 0L : entity.getSkipCount();
        long successCount = Math.max(sourceCount - failCount - skipCount, 0L);
        entity.setSuccessCount(successCount);
        entity.setTaskStatus(failCount > 0 ? "PARTIAL" : "SUCCESS");
        if (entity.getFinishedAt() == null) {
            entity.setFinishedAt(LocalDateTime.now());
        }
        if (!StringUtils.hasText(entity.getReportPath())) {
            entity.setReportPath("/data/migration/" + taskNo + "-report.csv");
        }
        migrationTaskMapper.updateById(entity);
        return entity;
    }

    /**
     * 分页查询迁移异常。
     */
    public PageResult<IntMigrationException> exceptionPage(IntMigrationExceptionQuery query) {
        Page<IntMigrationException> page = query.toPage();
        migrationExceptionMapper.selectPage(page, Wrappers.<IntMigrationException>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), IntMigrationException::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getExceptionType()),
                        IntMigrationException::getExceptionType, query.getExceptionType())
                .eq(StringUtils.hasText(query.getHandleStatus()),
                        IntMigrationException::getHandleStatus, query.getHandleStatus())
                .eq(StringUtils.hasText(query.getSourceKey()), IntMigrationException::getSourceKey, query.getSourceKey())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntMigrationException::getTaskNo, query.getKeyword()).or()
                        .like(IntMigrationException::getSourceKey, query.getKeyword()).or()
                        .like(IntMigrationException::getReason, query.getKeyword()))
                .orderByDesc(IntMigrationException::getId));
        return PageResult.of(page);
    }

    /**
     * 处理迁移异常：更新处理状态、处理人与处理时间。
     */
    public IntMigrationException exceptionHandle(Long id, IntMigrationExceptionHandleRequest request) {
        IntMigrationException exception = migrationExceptionMapper.selectById(id);
        if (exception == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "迁移异常不存在: " + id);
        }
        exception.setHandleStatus(request.getHandleStatus());
        exception.setHandler(UserContext.getUsername());
        exception.setHandledAt(LocalDateTime.now());
        exception.setRemark(request.getRemark());
        migrationExceptionMapper.updateById(exception);
        return exception;
    }
}
