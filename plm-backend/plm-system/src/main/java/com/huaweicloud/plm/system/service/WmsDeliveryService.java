package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.WmsDeliveryCreateRequest;
import com.huaweicloud.plm.system.dto.WmsDeliveryExecuteRequest;
import com.huaweicloud.plm.system.dto.WmsDeliveryQuery;
import com.huaweicloud.plm.system.entity.WmsDeliveryTask;
import com.huaweicloud.plm.system.entity.WmsKanban;
import com.huaweicloud.plm.system.mapper.WmsDeliveryTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 物料配送任务服务（N7，DEV-077）：派发/接单/配送/签收。
 */
@Service
@RequiredArgsConstructor
public class WmsDeliveryService {

    private static final String DEFAULT_TASK_TYPE = "REPLENISH";
    private static final String STATUS_CREATED = "CREATED";
    private static final String STATUS_ACCEPTED = "ACCEPTED";
    private static final String STATUS_DELIVERING = "DELIVERING";
    private static final String STATUS_SIGNED = "SIGNED";
    private static final String STATUS_CANCELLED = "CANCELLED";
    private static final int DEFAULT_PRIORITY = 5;
    private static final int KANBAN_PRIORITY = 3;

    private final WmsDeliveryTaskMapper wmsDeliveryTaskMapper;
    private final WmsSupportService wmsSupportService;

    public PageResult<WmsDeliveryTask> page(WmsDeliveryQuery query) {
        Page<WmsDeliveryTask> page = query.toPage();
        wmsDeliveryTaskMapper.selectPage(page, Wrappers.<WmsDeliveryTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskNo()), WmsDeliveryTask::getTaskNo, query.getTaskNo())
                .eq(StringUtils.hasText(query.getKanbanNo()), WmsDeliveryTask::getKanbanNo, query.getKanbanNo())
                .eq(StringUtils.hasText(query.getMaterialCode()), WmsDeliveryTask::getMaterialCode, query.getMaterialCode())
                .eq(StringUtils.hasText(query.getLineCode()), WmsDeliveryTask::getLineCode, query.getLineCode())
                .eq(StringUtils.hasText(query.getTaskStatus()), WmsDeliveryTask::getTaskStatus, query.getTaskStatus())
                .eq(StringUtils.hasText(query.getTaskType()), WmsDeliveryTask::getTaskType, query.getTaskType())
                .eq(StringUtils.hasText(query.getAssignee()), WmsDeliveryTask::getAssignee, query.getAssignee())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(WmsDeliveryTask::getTaskNo, query.getKeyword()).or()
                        .like(WmsDeliveryTask::getMaterialCode, query.getKeyword()).or()
                        .like(WmsDeliveryTask::getMaterialName, query.getKeyword()))
                .orderByDesc(WmsDeliveryTask::getId));
        return PageResult.of(page);
    }

    public WmsDeliveryTask requireTask(String taskNo) {
        WmsDeliveryTask task = wmsDeliveryTaskMapper.selectOne(Wrappers.<WmsDeliveryTask>lambdaQuery()
                .eq(WmsDeliveryTask::getTaskNo, taskNo));
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "配送任务不存在: " + taskNo);
        }
        return task;
    }

    public Long create(WmsDeliveryCreateRequest request) {
        WmsDeliveryTask task = new WmsDeliveryTask();
        task.setTaskNo(wmsSupportService.nextNo("DLV"));
        task.setKanbanNo(request.getKanbanNo());
        task.setTaskType(StringUtils.hasText(request.getTaskType())
                ? request.getTaskType() : DEFAULT_TASK_TYPE);
        task.setMaterialCode(request.getMaterialCode());
        task.setMaterialName(request.getMaterialName());
        task.setQty(request.getQty() == null ? BigDecimal.ZERO : request.getQty());
        task.setUnit(request.getUnit());
        task.setFromLocationCode(request.getFromLocationCode());
        task.setToLocationCode(request.getToLocationCode());
        task.setLineCode(request.getLineCode());
        task.setWorkStation(request.getWorkStation());
        task.setBatchNo(request.getBatchNo());
        task.setPriority(request.getPriority() == null ? DEFAULT_PRIORITY : request.getPriority());
        task.setTaskStatus(STATUS_CREATED);
        task.setDispatchAt(LocalDateTime.now());
        task.setRemark(request.getRemark());
        wmsDeliveryTaskMapper.insert(task);
        return task.getId();
    }

    /**
     * 由看板拉动生成配送任务（供看板服务调用）。
     */
    @Transactional(rollbackFor = Exception.class)
    public WmsDeliveryTask createFromKanban(WmsKanban kanban, BigDecimal qty) {
        WmsDeliveryTask task = new WmsDeliveryTask();
        task.setTaskNo(wmsSupportService.nextNo("DLV"));
        task.setKanbanNo(kanban.getKanbanNo());
        task.setTaskType(DEFAULT_TASK_TYPE);
        task.setMaterialCode(kanban.getMaterialCode());
        task.setMaterialName(kanban.getMaterialName());
        task.setQty(qty == null ? BigDecimal.ZERO : qty);
        task.setUnit(null);
        task.setFromLocationCode(kanban.getFromLocationCode());
        task.setToLocationCode(StringUtils.hasText(kanban.getFromLocationCode())
                ? kanban.getFromLocationCode() : null);
        task.setLineCode(kanban.getLineCode());
        task.setWorkStation(kanban.getWorkStation());
        task.setPriority(KANBAN_PRIORITY);
        task.setTaskStatus(STATUS_CREATED);
        task.setDispatchAt(LocalDateTime.now());
        wmsDeliveryTaskMapper.insert(task);
        return task;
    }

    public void accept(String taskNo, WmsDeliveryExecuteRequest request) {
        WmsDeliveryTask task = requireTask(taskNo);
        if (!STATUS_CREATED.equals(task.getTaskStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可接单: " + task.getTaskStatus());
        }
        task.setTaskStatus(STATUS_ACCEPTED);
        task.setAssignee(StringUtils.hasText(request.getAssignee())
                ? request.getAssignee() : UserContext.getUsername());
        task.setAcceptAt(LocalDateTime.now());
        applyRemark(task, request);
        wmsDeliveryTaskMapper.updateById(task);
    }

    public void deliver(String taskNo, WmsDeliveryExecuteRequest request) {
        WmsDeliveryTask task = requireTask(taskNo);
        if (!STATUS_ACCEPTED.equals(task.getTaskStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可配送: " + task.getTaskStatus());
        }
        task.setTaskStatus(STATUS_DELIVERING);
        task.setDeliverAt(LocalDateTime.now());
        applyRemark(task, request);
        wmsDeliveryTaskMapper.updateById(task);
    }

    public void sign(String taskNo, WmsDeliveryExecuteRequest request) {
        WmsDeliveryTask task = requireTask(taskNo);
        if (!STATUS_ACCEPTED.equals(task.getTaskStatus())
                && !STATUS_DELIVERING.equals(task.getTaskStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可签收: " + task.getTaskStatus());
        }
        task.setTaskStatus(STATUS_SIGNED);
        task.setSignAt(LocalDateTime.now());
        task.setSignBy(StringUtils.hasText(request.getSignBy())
                ? request.getSignBy() : UserContext.getUsername());
        applyRemark(task, request);
        wmsDeliveryTaskMapper.updateById(task);
    }

    public void cancel(String taskNo, WmsDeliveryExecuteRequest request) {
        WmsDeliveryTask task = requireTask(taskNo);
        if (STATUS_SIGNED.equals(task.getTaskStatus())
                || STATUS_CANCELLED.equals(task.getTaskStatus())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "当前状态不可取消: " + task.getTaskStatus());
        }
        task.setTaskStatus(STATUS_CANCELLED);
        applyRemark(task, request);
        wmsDeliveryTaskMapper.updateById(task);
    }

    private void applyRemark(WmsDeliveryTask task, WmsDeliveryExecuteRequest request) {
        if (request != null && StringUtils.hasText(request.getRemark())) {
            task.setRemark(request.getRemark());
        }
    }
}
