package com.huaweicloud.plm.system.service;

import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.TaskApproveRequest;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.mapper.OaProcessDefinitionMapper;
import com.huaweicloud.plm.system.mapper.OaProcessInstanceMapper;
import com.huaweicloud.plm.system.mapper.OaProcessNodeMapper;
import com.huaweicloud.plm.system.mapper.OaTaskMapper;
import com.huaweicloud.plm.system.mapper.OaTaskRecordMapper;
import com.huaweicloud.plm.system.mapper.SysDelegationMapper;
import com.huaweicloud.plm.system.mapper.SysEmploymentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;
import org.springframework.context.ApplicationEventPublisher;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.mockStatic;
import static org.mockito.Mockito.when;

class WorkflowEngineServiceTest {

    @Test
    void preventsApplicantFromApprovingOwnProcess() {
        long applicantId = 42L;
        long taskId = 101L;
        long instanceId = 202L;

        OaTaskMapper taskMapper = mock(OaTaskMapper.class);
        OaProcessInstanceMapper instanceMapper = mock(OaProcessInstanceMapper.class);
        OaTask task = new OaTask();
        task.setId(taskId);
        task.setInstanceId(instanceId);
        task.setAssigneeUserId(applicantId);
        task.setTaskStatus(WorkflowEngineService.TASK_PENDING);
        when(taskMapper.selectById(taskId)).thenReturn(task);

        OaProcessInstance instance = new OaProcessInstance();
        instance.setId(instanceId);
        instance.setApplicantUserId(applicantId);
        instance.setInstanceStatus(WorkflowEngineService.INSTANCE_RUNNING);
        when(instanceMapper.selectById(instanceId)).thenReturn(instance);

        WorkflowEngineService service = new WorkflowEngineService(
                mock(OaProcessDefinitionMapper.class),
                mock(OaProcessNodeMapper.class),
                instanceMapper,
                taskMapper,
                mock(OaTaskRecordMapper.class),
                mock(SysUserMapper.class),
                mock(SysUserRoleMapper.class),
                mock(SysEmploymentMapper.class),
                mock(SysDelegationMapper.class),
                mock(ConfigService.class),
                mock(NotificationService.class),
                mock(ApplicationEventPublisher.class));

        try (MockedStatic<UserContext> userContext = mockStatic(UserContext.class)) {
            userContext.when(UserContext::getUserId).thenReturn(applicantId);
            TaskApproveRequest request = new TaskApproveRequest();
            request.setAction("APPROVE");
            request.setCommentText("self-approval");

            assertThrows(BusinessException.class,
                    () -> service.approve(taskId, request));
        }
    }
}
