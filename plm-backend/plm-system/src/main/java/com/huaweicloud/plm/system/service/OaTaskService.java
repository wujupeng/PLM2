package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.TaskItemResponse;
import com.huaweicloud.plm.system.dto.TaskQuery;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.mapper.OaProcessInstanceMapper;
import com.huaweicloud.plm.system.mapper.OaTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.util.StringUtils;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

/**
 * 审批任务查询服务：我的待办、我的已办。
 */
@Service
@RequiredArgsConstructor
public class OaTaskService {

    private final OaTaskMapper taskMapper;
    private final OaProcessInstanceMapper instanceMapper;

    /** 我的待办：默认查询当前登录用户待处理的任务。 */
    public PageResult<TaskItemResponse> pageTodo(TaskQuery query) {
        String taskStatus = StringUtils.hasText(query.getTaskStatus())
                ? query.getTaskStatus() : WorkflowEngineService.TASK_PENDING;
        return pageTasks(query, taskStatus, null);
    }

    /** 我的已办：默认查询当前登录用户已同意或已驳回的任务。 */
    public PageResult<TaskItemResponse> pageDone(TaskQuery query) {
        List<String> statuses = StringUtils.hasText(query.getTaskStatus())
                ? Collections.singletonList(query.getTaskStatus())
                : List.of(WorkflowEngineService.TASK_APPROVED, WorkflowEngineService.TASK_REJECTED);
        return pageTasks(query, null, statuses);
    }

    private PageResult<TaskItemResponse> pageTasks(TaskQuery query, String taskStatus, List<String> taskStatuses) {
        Long userId = currentUserId();
        List<Long> matchedInstanceIds = null;
        if (StringUtils.hasText(query.getKeyword())) {
            matchedInstanceIds = instanceIdsByKeyword(query.getKeyword());
            if (matchedInstanceIds.isEmpty()) {
                return PageResult.empty(query.normalizedPageNum(), query.normalizedPageSize());
            }
        }

        Page<OaTask> page = query.toPage();
        taskMapper.selectPage(page, Wrappers.<OaTask>lambdaQuery()
                .eq(OaTask::getAssigneeUserId, userId)
                .eq(StringUtils.hasText(taskStatus), OaTask::getTaskStatus, taskStatus)
                .in(!CollectionUtils.isEmpty(taskStatuses), OaTask::getTaskStatus, taskStatuses)
                .eq(query.getInstanceId() != null, OaTask::getInstanceId, query.getInstanceId())
                .in(matchedInstanceIds != null, OaTask::getInstanceId, matchedInstanceIds)
                .orderByDesc(OaTask::getCreatedAt));

        List<OaTask> records = page.getRecords();
        Map<Long, OaProcessInstance> instances = loadInstances(records);
        List<TaskItemResponse> items = records.stream()
                .map(task -> toItem(task, instances.get(task.getInstanceId())))
                .toList();
        return new PageResult<>(items, page.getTotal(), page.getCurrent(), page.getSize());
    }

    private List<Long> instanceIdsByKeyword(String keyword) {
        return instanceMapper.selectList(Wrappers.<OaProcessInstance>lambdaQuery()
                        .and(w -> w.like(OaProcessInstance::getTitle, keyword).or()
                                .like(OaProcessInstance::getInstanceNo, keyword)))
                .stream().map(OaProcessInstance::getId).toList();
    }

    private Map<Long, OaProcessInstance> loadInstances(List<OaTask> tasks) {
        List<Long> instanceIds = tasks.stream().map(OaTask::getInstanceId).distinct().toList();
        if (instanceIds.isEmpty()) {
            return Collections.emptyMap();
        }
        return instanceMapper.selectBatchIds(instanceIds).stream()
                .collect(Collectors.toMap(OaProcessInstance::getId, Function.identity(), (a, b) -> a));
    }

    private TaskItemResponse toItem(OaTask task, OaProcessInstance instance) {
        TaskItemResponse item = new TaskItemResponse();
        item.setTaskId(task.getId());
        item.setTaskNo(task.getTaskNo());
        item.setInstanceId(task.getInstanceId());
        item.setNodeCode(task.getNodeCode());
        item.setNodeName(task.getNodeName());
        item.setTaskStatus(task.getTaskStatus());
        item.setAction(task.getAction());
        item.setCommentText(task.getCommentText());
        item.setDueAt(task.getDueAt());
        item.setHandledAt(task.getHandledAt());
        item.setCreatedAt(task.getCreatedAt());
        if (instance != null) {
            item.setInstanceNo(instance.getInstanceNo());
            item.setProcessName(instance.getProcessName());
            item.setTitle(instance.getTitle());
            item.setApplicantName(instance.getApplicantName());
        }
        return item;
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }
}
