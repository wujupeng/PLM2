package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.CollabTaskQuery;
import com.huaweicloud.plm.system.dto.CollabTaskSaveRequest;
import com.huaweicloud.plm.system.entity.OaOaCollabTask;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.mapper.OaOaCollabTaskMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Set;

/**
 * 协同办公协作任务服务：团队任务的维护、状态流转与负责人查询。
 */
@Service
@RequiredArgsConstructor
public class OaCollabTaskService {

    public static final String STATUS_TODO = "TODO";
    public static final String STATUS_DOING = "DOING";
    public static final String STATUS_DONE = "DONE";
    public static final String STATUS_CLOSED = "CLOSED";

    public static final String PRIORITY_LOW = "LOW";
    public static final String PRIORITY_NORMAL = "NORMAL";
    public static final String PRIORITY_HIGH = "HIGH";
    public static final String PRIORITY_URGENT = "URGENT";

    private static final String NO_PREFIX = "TASK";

    private static final Set<String> VALID_STATUSES =
            Set.of(STATUS_TODO, STATUS_DOING, STATUS_DONE, STATUS_CLOSED);

    private final OaOaCollabTaskMapper taskMapper;
    private final HrFlowSupport flowSupport;
    private final SysUserMapper userMapper;

    /** 协作任务分页：ownerUserId 非空时按负责人过滤，支持状态与关键词。 */
    public PageResult<OaOaCollabTask> page(CollabTaskQuery query, Long ownerUserId) {
        Page<OaOaCollabTask> page = query.toPage();
        taskMapper.selectPage(page, Wrappers.<OaOaCollabTask>lambdaQuery()
                .eq(ownerUserId != null, OaOaCollabTask::getOwnerUserId, ownerUserId)
                .eq(StringUtils.hasText(query.getTaskStatus()),
                        OaOaCollabTask::getTaskStatus, query.getTaskStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaOaCollabTask::getTitle, query.getKeyword()).or()
                        .like(OaOaCollabTask::getContent, query.getKeyword()))
                .orderByDesc(OaOaCollabTask::getId));
        return PageResult.of(page);
    }

    public OaOaCollabTask requireTask(Long id) {
        OaOaCollabTask task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "协作任务不存在: " + id);
        }
        return task;
    }

    public OaOaCollabTask detail(Long id) {
        return requireTask(id);
    }

    /** 新建任务：默认待办状态与普通优先级，生成编号。 */
    @Transactional
    public Long create(CollabTaskSaveRequest request) {
        OaOaCollabTask task = new OaOaCollabTask();
        applyRequest(task, request);
        task.setTaskNo(flowSupport.nextNo(NO_PREFIX));
        task.setTaskStatus(StringUtils.hasText(request.getTaskStatus()) ? request.getTaskStatus() : STATUS_TODO);
        task.setPriority(StringUtils.hasText(request.getPriority()) ? request.getPriority() : PRIORITY_NORMAL);
        task.setOwnerName(resolveDisplayName(request.getOwnerUserId()));
        UserContext.Principal principal = UserContext.get();
        if (principal != null) {
            task.setOrgId(principal.orgId());
        }
        taskMapper.insert(task);
        return task.getId();
    }

    @Transactional
    public void update(Long id, CollabTaskSaveRequest request) {
        OaOaCollabTask task = requireTask(id);
        applyRequest(task, request);
        if (StringUtils.hasText(request.getTaskStatus())) {
            task.setTaskStatus(request.getTaskStatus());
        }
        if (StringUtils.hasText(request.getPriority())) {
            task.setPriority(request.getPriority());
        }
        if (request.getOwnerUserId() != null) {
            task.setOwnerName(resolveDisplayName(request.getOwnerUserId()));
        }
        taskMapper.updateById(task);
    }

    /** 变更任务状态：仅允许 TODO/DOING/DONE/CLOSED。 */
    @Transactional
    public void changeStatus(Long id, String status) {
        if (!VALID_STATUSES.contains(status)) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "非法的任务状态: " + status);
        }
        OaOaCollabTask task = requireTask(id);
        task.setTaskStatus(status);
        taskMapper.updateById(task);
    }

    @Transactional
    public void delete(Long id) {
        requireTask(id);
        taskMapper.deleteById(id);
    }

    private void applyRequest(OaOaCollabTask task, CollabTaskSaveRequest request) {
        task.setTitle(request.getTitle());
        task.setContent(request.getContent());
        task.setOwnerUserId(request.getOwnerUserId());
        task.setParticipantJson(request.getParticipantJson());
        task.setDueAt(request.getDueAt());
        task.setProgress(request.getProgress());
        task.setParentId(request.getParentId());
        task.setRemark(request.getRemark());
    }

    private String resolveDisplayName(Long userId) {
        if (userId == null) {
            return null;
        }
        SysUser user = userMapper.selectById(userId);
        if (user == null) {
            return null;
        }
        return StringUtils.hasText(user.getDisplayName()) ? user.getDisplayName() : user.getUsername();
    }
}
