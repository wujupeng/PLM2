package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.FileQuery;
import com.huaweicloud.plm.system.dto.SysFilePreviewTaskSaveRequest;
import com.huaweicloud.plm.system.entity.SysFilePreviewTask;
import com.huaweicloud.plm.system.mapper.SysFilePreviewTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 预览转换任务（G1-N3 公共平台底座—统一文件服务 WBS T011）：转换任务登记、执行状态流转与统计。
 * 任务编号支持人工指定，删除语义为「释放编码」，采用物理删除以保持与唯一索引一致。
 */
@Service
@RequiredArgsConstructor
public class SysFilePreviewTaskService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_PROCESSING = "PROCESSING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";

    private final SysFilePreviewTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    /** 分页查询预览转换任务：任务状态与转换模式精确，关键字匹配任务编号/附件编号/文件名称，时间区间作用于创建时间。 */
    public PageResult<SysFilePreviewTask> pageTasks(FileQuery query) {
        Page<SysFilePreviewTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysFilePreviewTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        SysFilePreviewTask::getTaskStatus, query.getTaskStatus())
                .eq(StringUtils.hasText(query.getConvertMode()),
                        SysFilePreviewTask::getConvertMode, query.getConvertMode())
                .ge(StringUtils.hasText(query.getStartDate()), SysFilePreviewTask::getCreatedAt,
                        OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()), SysFilePreviewTask::getCreatedAt,
                        OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysFilePreviewTask::getTaskNo, query.getKeyword()).or()
                        .like(SysFilePreviewTask::getFileNo, query.getKeyword()).or()
                        .like(SysFilePreviewTask::getFileName, query.getKeyword()))
                .orderByDesc(SysFilePreviewTask::getId));
        return PageResult.of(page);
    }

    public SysFilePreviewTask detail(Long id) {
        return require(id);
    }

    /** 新增或更新预览转换任务：新增时回填默认目标格式、转换模式、任务状态与计数，并回填组织。 */
    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysFilePreviewTaskSaveRequest request) {
        SysFilePreviewTask entity;
        if (id == null) {
            entity = new SysFilePreviewTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo("FPV"));
            entity.setTargetFormat("PDF");
            entity.setConvertMode("OFFICE");
            entity.setTaskStatus(STATUS_PENDING);
            entity.setRetryCount(0);
            entity.setCostMs(0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = require(id);
            if (StringUtils.hasText(request.getTaskNo())) {
                entity.setTaskNo(request.getTaskNo());
            }
        }
        applyRequest(entity, request);
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 开始转换：任务状态置为 PROCESSING，回填开始时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFilePreviewTask start(Long id) {
        SysFilePreviewTask entity = require(id);
        entity.setTaskStatus(STATUS_PROCESSING);
        entity.setStartTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 转换完成：任务状态置为 SUCCESS，回填结束时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFilePreviewTask complete(Long id) {
        SysFilePreviewTask entity = require(id);
        entity.setTaskStatus(STATUS_SUCCESS);
        entity.setEndTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 转换失败：任务状态置为 FAILED，回填结束时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysFilePreviewTask fail(Long id) {
        SysFilePreviewTask entity = require(id);
        entity.setTaskStatus(STATUS_FAILED);
        entity.setEndTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 删除任务：物理删除以释放编码，避免软删除行占用唯一索引导致再次登记冲突。 */
    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        require(id);
        mapper.physicalDeleteById(id);
    }

    /** 预览转换任务统计：按任务状态汇总并统计总耗时。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", countByStatus(STATUS_PENDING));
        result.put("processing", countByStatus(STATUS_PROCESSING));
        result.put("success", countByStatus(STATUS_SUCCESS));
        result.put("failed", countByStatus(STATUS_FAILED));
        long totalCostMs = 0L;
        List<SysFilePreviewTask> tasks = mapper.selectList(null);
        if (tasks != null) {
            for (SysFilePreviewTask task : tasks) {
                if (task.getCostMs() != null) {
                    totalCostMs += task.getCostMs();
                }
            }
        }
        result.put("totalCostMs", totalCostMs);
        return result;
    }

    public SysFilePreviewTask require(Long id) {
        SysFilePreviewTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "预览转换任务不存在: " + id);
        }
        return entity;
    }

    /** 仅在请求提供值（字符串非空、数值/时间非空）时覆盖实体对应字段。 */
    private void applyRequest(SysFilePreviewTask entity, SysFilePreviewTaskSaveRequest request) {
        if (StringUtils.hasText(request.getFileNo())) {
            entity.setFileNo(request.getFileNo());
        }
        if (StringUtils.hasText(request.getFileName())) {
            entity.setFileName(request.getFileName());
        }
        if (StringUtils.hasText(request.getSourceExt())) {
            entity.setSourceExt(request.getSourceExt());
        }
        if (StringUtils.hasText(request.getTargetFormat())) {
            entity.setTargetFormat(request.getTargetFormat());
        }
        if (StringUtils.hasText(request.getConvertMode())) {
            entity.setConvertMode(request.getConvertMode());
        }
        if (StringUtils.hasText(request.getConvertEngine())) {
            entity.setConvertEngine(request.getConvertEngine());
        }
        if (StringUtils.hasText(request.getTaskStatus())) {
            entity.setTaskStatus(request.getTaskStatus());
        }
        if (StringUtils.hasText(request.getPreviewUrl())) {
            entity.setPreviewUrl(request.getPreviewUrl());
        }
        if (StringUtils.hasText(request.getErrorMessage())) {
            entity.setErrorMessage(request.getErrorMessage());
        }
        if (request.getRetryCount() != null) {
            entity.setRetryCount(request.getRetryCount());
        }
        if (request.getStartTime() != null) {
            entity.setStartTime(request.getStartTime());
        }
        if (request.getEndTime() != null) {
            entity.setEndTime(request.getEndTime());
        }
        if (request.getCostMs() != null) {
            entity.setCostMs(request.getCostMs());
        }
        if (StringUtils.hasText(request.getOrgName())) {
            entity.setOrgName(request.getOrgName());
        }
        if (StringUtils.hasText(request.getRemark())) {
            entity.setRemark(request.getRemark());
        }
    }

    private Long countByStatus(String taskStatus) {
        return countBy(SysFilePreviewTask::getTaskStatus, taskStatus);
    }

    private Long countBy(SFunction<SysFilePreviewTask, ?> column, Object value) {
        Long count = mapper.selectCount(Wrappers.<SysFilePreviewTask>lambdaQuery().eq(column, value));
        return count == null ? 0L : count;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
