package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntExportTaskQuery;
import com.huaweicloud.plm.system.dto.IntExportTaskSaveRequest;
import com.huaweicloud.plm.system.entity.IntExportTask;
import com.huaweicloud.plm.system.mapper.IntExportTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

/** 导出任务服务（N9，DEV-099）。 */
@Service
@RequiredArgsConstructor
public class IntExportTaskService {

    private final IntExportTaskMapper exportTaskMapper;
    private final IntSupportService intSupport;

    /**
     * 分页查询导出任务。
     */
    public PageResult<IntExportTask> page(IntExportTaskQuery query) {
        Page<IntExportTask> page = query.toPage();
        exportTaskMapper.selectPage(page, Wrappers.<IntExportTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), IntExportTask::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getScope()), IntExportTask::getScope, query.getScope())
                .eq(StringUtils.hasText(query.getExportFormat()),
                        IntExportTask::getExportFormat, query.getExportFormat())
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        IntExportTask::getTaskStatus, query.getTaskStatus())
                .eq(StringUtils.hasText(query.getRequestedBy()),
                        IntExportTask::getRequestedBy, query.getRequestedBy())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(IntExportTask::getTaskNo, query.getKeyword()).or()
                        .like(IntExportTask::getFilePath, query.getKeyword()).or()
                        .like(IntExportTask::getRequestedBy, query.getKeyword()))
                .orderByDesc(IntExportTask::getId));
        return PageResult.of(page);
    }

    /**
     * 按任务编号获取导出任务，不存在时抛出业务异常。
     */
    public IntExportTask require(String taskNo) {
        IntExportTask entity = exportTaskMapper.selectOne(Wrappers.<IntExportTask>lambdaQuery()
                .eq(IntExportTask::getTaskNo, taskNo));
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "导出任务不存在: " + taskNo);
        }
        return entity;
    }

    /**
     * 新增导出任务，返回任务编号。
     */
    public String create(IntExportTaskSaveRequest request) {
        IntExportTask entity = new IntExportTask();
        entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                ? request.getTaskNo() : intSupport.nextNo("EXP"));
        entity.setScope(request.getScope());
        entity.setExportFormat(StringUtils.hasText(request.getExportFormat())
                ? request.getExportFormat() : "CSV");
        entity.setIncludeAttachment(request.getIncludeAttachment() == null ? 0 : request.getIncludeAttachment());
        entity.setRecordCount(0L);
        entity.setTaskStatus("PENDING");
        entity.setRequestedBy(UserContext.getUsername());
        entity.setRemark(request.getRemark());
        exportTaskMapper.insert(entity);
        return entity.getTaskNo();
    }

    /**
     * 更新导出任务。
     */
    public void update(String taskNo, IntExportTaskSaveRequest request) {
        IntExportTask entity = require(taskNo);
        entity.setScope(request.getScope());
        entity.setExportFormat(StringUtils.hasText(request.getExportFormat())
                ? request.getExportFormat() : entity.getExportFormat());
        entity.setIncludeAttachment(request.getIncludeAttachment() == null ? 0 : request.getIncludeAttachment());
        entity.setRemark(request.getRemark());
        exportTaskMapper.updateById(entity);
    }

    /**
     * 删除导出任务。
     */
    public void delete(String taskNo) {
        IntExportTask entity = require(taskNo);
        exportTaskMapper.deleteById(entity.getId());
    }

    /**
     * 执行导出任务：按导出格式生成文件路径并置为成功。
     */
    public IntExportTask run(String taskNo) {
        IntExportTask entity = require(taskNo);
        if ("SUCCESS".equals(entity.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "导出任务已完成，无需重复执行: " + taskNo);
        }
        entity.setTaskStatus("RUNNING");
        if (entity.getStartedAt() == null) {
            entity.setStartedAt(LocalDateTime.now());
        }
        String ext;
        if ("EXCEL".equalsIgnoreCase(entity.getExportFormat())) {
            ext = "xlsx";
        } else if ("JSON".equalsIgnoreCase(entity.getExportFormat())) {
            ext = "json";
        } else {
            ext = "csv";
        }
        if (!StringUtils.hasText(entity.getFilePath())) {
            entity.setFilePath("/data/export/" + taskNo + "." + ext);
        }
        entity.setTaskStatus("SUCCESS");
        entity.setFinishedAt(LocalDateTime.now());
        entity.setErrorMessage(null);
        exportTaskMapper.updateById(entity);
        return entity;
    }
}
