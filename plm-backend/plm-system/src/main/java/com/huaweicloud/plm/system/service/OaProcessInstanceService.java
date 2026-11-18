package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.InstanceDetailResponse;
import com.huaweicloud.plm.system.dto.InstanceQuery;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.mapper.OaProcessInstanceMapper;
import com.huaweicloud.plm.system.mapper.OaTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * 流程实例查询服务：我的申请、流程监控、实例详情与撤回。
 */
@Service
@RequiredArgsConstructor
public class OaProcessInstanceService {

    private final OaProcessInstanceMapper instanceMapper;
    private final OaTaskMapper taskMapper;
    private final WorkflowEngineService workflowEngineService;

    /** 我的申请：仅查询当前登录用户发起的流程实例。 */
    public PageResult<OaProcessInstance> pageMine(InstanceQuery query) {
        return pageInternal(query, currentUserId());
    }

    /** 流程监控：按条件查询全部流程实例。 */
    public PageResult<OaProcessInstance> pageMonitor(InstanceQuery query) {
        return pageInternal(query, null);
    }

    public InstanceDetailResponse getDetail(Long instanceId) {
        OaProcessInstance instance = requireInstance(instanceId);
        InstanceDetailResponse response = new InstanceDetailResponse();
        response.setInstance(instance);
        response.setRecords(workflowEngineService.listRecords(instanceId));
        response.setPendingTasks(taskMapper.selectList(Wrappers.<OaTask>lambdaQuery()
                .eq(OaTask::getInstanceId, instanceId)
                .eq(OaTask::getTaskStatus, WorkflowEngineService.TASK_PENDING)
                .orderByAsc(OaTask::getCreatedAt)));
        return response;
    }

    public void cancel(Long instanceId) {
        workflowEngineService.cancel(instanceId);
    }

    public OaProcessInstance requireInstance(Long instanceId) {
        OaProcessInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程实例不存在: " + instanceId);
        }
        return instance;
    }

    private PageResult<OaProcessInstance> pageInternal(InstanceQuery query, Long applicantUserId) {
        Page<OaProcessInstance> page = query.toPage();
        instanceMapper.selectPage(page, Wrappers.<OaProcessInstance>lambdaQuery()
                .eq(applicantUserId != null, OaProcessInstance::getApplicantUserId, applicantUserId)
                .eq(query.getProcessId() != null, OaProcessInstance::getProcessId, query.getProcessId())
                .eq(StringUtils.hasText(query.getInstanceStatus()),
                        OaProcessInstance::getInstanceStatus, query.getInstanceStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaProcessInstance::getTitle, query.getKeyword()).or()
                        .like(OaProcessInstance::getInstanceNo, query.getKeyword()).or()
                        .like(OaProcessInstance::getProcessName, query.getKeyword()))
                .orderByDesc(OaProcessInstance::getCreatedAt));
        return PageResult.of(page);
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }
}
