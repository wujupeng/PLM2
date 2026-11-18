package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.ProcessStartRequest;
import com.huaweicloud.plm.system.dto.TaskApproveRequest;
import com.huaweicloud.plm.system.entity.OaProcessDefinition;
import com.huaweicloud.plm.system.entity.OaProcessInstance;
import com.huaweicloud.plm.system.entity.OaProcessNode;
import com.huaweicloud.plm.system.entity.OaTask;
import com.huaweicloud.plm.system.entity.OaTaskRecord;
import com.huaweicloud.plm.system.entity.SysDelegation;
import com.huaweicloud.plm.system.entity.SysEmployment;
import com.huaweicloud.plm.system.entity.SysUser;
import com.huaweicloud.plm.system.entity.SysUserRole;
import com.huaweicloud.plm.system.event.WorkflowInstanceEvent;
import com.huaweicloud.plm.system.mapper.OaProcessDefinitionMapper;
import com.huaweicloud.plm.system.mapper.OaProcessInstanceMapper;
import com.huaweicloud.plm.system.mapper.OaProcessNodeMapper;
import com.huaweicloud.plm.system.mapper.OaTaskMapper;
import com.huaweicloud.plm.system.mapper.OaTaskRecordMapper;
import com.huaweicloud.plm.system.mapper.SysDelegationMapper;
import com.huaweicloud.plm.system.mapper.SysEmploymentMapper;
import com.huaweicloud.plm.system.mapper.SysUserMapper;
import com.huaweicloud.plm.system.mapper.SysUserRoleMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.ThreadLocalRandom;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 低代码工作流引擎：流程实例发起、审批人解析、节点流转、驳回、撤回与审批轨迹记录。
 * 审批人规则、驳回策略、审批时限均来自可配置项，不写死在代码里。
 */
@Service
@RequiredArgsConstructor
public class WorkflowEngineService {

    private static final DateTimeFormatter NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    /** 通知正文中的时间展示格式。 */
    private static final DateTimeFormatter DISPLAY_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /** 秒内序列，避免同一秒内编号冲突。 */
    private static final AtomicInteger SECOND_SEQUENCE = new AtomicInteger(0);

    public static final String INSTANCE_RUNNING = "RUNNING";
    public static final String INSTANCE_APPROVED = "APPROVED";
    public static final String INSTANCE_REJECTED = "REJECTED";
    public static final String INSTANCE_CANCELLED = "CANCELLED";

    public static final String TASK_PENDING = "PENDING";
    public static final String TASK_APPROVED = "APPROVED";
    public static final String TASK_REJECTED = "REJECTED";
    public static final String TASK_CANCELLED = "CANCELLED";

    public static final String ACTION_SUBMIT = "SUBMIT";
    public static final String ACTION_APPROVE = "APPROVE";
    public static final String ACTION_REJECT = "REJECT";
    public static final String ACTION_CANCEL = "CANCEL";
    public static final String ACTION_CC = "CC";
    public static final String ACTION_SKIP = "SKIP";

    private static final String NODE_TYPE_START = "START";
    private static final String NODE_TYPE_END = "END";
    private static final String NODE_TYPE_CC = "CC";

    private static final String APPROVER_USER = "USER";
    private static final String APPROVER_ROLE = "ROLE";
    private static final String APPROVER_ORG_MANAGER = "ORG_MANAGER";
    private static final String APPROVER_APPLICANT_MANAGER = "APPLICANT_MANAGER";
    private static final String APPROVER_PROCESS_STARTER = "PROCESS_STARTER";

    private static final String REJECT_BACK_TO_PREV = "BACK_TO_PREV";
    private static final String REJECT_BACK_TO_START = "BACK_TO_START";

    private static final String DELEGATION_ACTIVE = "ACTIVE";

    private final OaProcessDefinitionMapper processMapper;
    private final OaProcessNodeMapper processNodeMapper;
    private final OaProcessInstanceMapper instanceMapper;
    private final OaTaskMapper taskMapper;
    private final OaTaskRecordMapper taskRecordMapper;
    private final SysUserMapper userMapper;
    private final SysUserRoleMapper userRoleMapper;
    private final SysEmploymentMapper employmentMapper;
    private final SysDelegationMapper delegationMapper;
    private final ConfigService configService;
    private final NotificationService notificationService;
    private final ApplicationEventPublisher eventPublisher;

    /**
     * 发起流程实例：创建实例 -> 写提交轨迹 -> 按首个可审批节点生成待办任务。
     */
    @Transactional
    public Long start(ProcessStartRequest request) {
        Long userId = currentUserId();
        OaProcessDefinition process = processMapper.selectById(request.getProcessId());
        if (process == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程不存在: " + request.getProcessId());
        }
        if (!ProcessDefinitionService.STATUS_PUBLISHED.equals(process.getStatus())) {
            throw new BusinessException("流程未发布，无法发起: " + process.getProcessName());
        }
        List<OaProcessNode> flowNodes = flowNodes(process.getId());
        if (flowNodes.isEmpty()) {
            throw new BusinessException("流程未配置有效审批节点，无法发起");
        }

        String applicantName = resolveDisplayName(userId);
        OaProcessInstance instance = new OaProcessInstance();
        instance.setInstanceNo(nextNo(config("oa.workflow.instance.no.prefix", "OA-")));
        instance.setProcessId(process.getId());
        instance.setProcessCode(process.getProcessCode());
        instance.setProcessName(process.getProcessName());
        instance.setFormId(process.getFormId());
        instance.setBusinessKey(request.getBusinessKey());
        instance.setTitle(StringUtils.hasText(request.getTitle()) ? request.getTitle() : process.getProcessName());
        instance.setApplicantUserId(userId);
        instance.setApplicantName(applicantName);
        instance.setInstanceStatus(INSTANCE_RUNNING);
        instance.setFormDataJson(request.getFormDataJson());
        instance.setSubmittedAt(LocalDateTime.now());
        instance.setRemark(request.getRemark());
        instanceMapper.insert(instance);

        writeRecord(instance.getId(), null, null, "提交申请", userId, applicantName,
                ACTION_SUBMIT, request.getRemark());

        advance(instance, flowNodes, 0);
        instanceMapper.updateById(instance);
        publishIfFinal(instance);
        return instance.getId();
    }

    /**
     * 处理审批任务：同意则推进到下一节点或结束流程；驳回则按配置策略流转。
     */
    @Transactional
    public void approve(Long taskId, TaskApproveRequest request) {
        Long userId = currentUserId();
        OaTask task = taskMapper.selectById(taskId);
        if (task == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "审批任务不存在: " + taskId);
        }
        if (!TASK_PENDING.equals(task.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "该任务已处理，不能重复审批");
        }
        if (!Objects.equals(task.getAssigneeUserId(), userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只能处理分配给自己的审批任务");
        }
        OaProcessInstance instance = instanceMapper.selectById(task.getInstanceId());
        if (instance == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程实例不存在: " + task.getInstanceId());
        }
        if (!INSTANCE_RUNNING.equals(instance.getInstanceStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "流程已结束，无法审批");
        }

        String action = request.getAction() == null ? "" : request.getAction().trim().toUpperCase();
        boolean approve = ACTION_APPROVE.equals(action);
        boolean reject = ACTION_REJECT.equals(action);
        if (!approve && !reject) {
            throw new BusinessException("不支持的审批动作: " + request.getAction());
        }

        task.setTaskStatus(approve ? TASK_APPROVED : TASK_REJECTED);
        task.setAction(approve ? ACTION_APPROVE : ACTION_REJECT);
        task.setCommentText(request.getCommentText());
        task.setHandledAt(LocalDateTime.now());
        taskMapper.updateById(task);
        writeRecord(instance.getId(), task.getId(), task.getNodeCode(), task.getNodeName(),
                userId, resolveDisplayName(userId), task.getAction(), request.getCommentText());

        if (!approve) {
            applyReject(instance, task);
            publishIfFinal(instance);
            return;
        }

        // 会签简化处理：同一节点仍有其他待办任务时，等待其余审批人处理完成
        long remaining = taskMapper.selectCount(Wrappers.<OaTask>lambdaQuery()
                .eq(OaTask::getInstanceId, instance.getId())
                .eq(OaTask::getNodeCode, task.getNodeCode())
                .eq(OaTask::getTaskStatus, TASK_PENDING));
        if (remaining > 0) {
            return;
        }

        List<OaProcessNode> flowNodes = flowNodes(instance.getProcessId());
        int index = indexOfNode(flowNodes, task.getNodeCode());
        advance(instance, flowNodes, index + 1);
        instanceMapper.updateById(instance);
        publishIfFinal(instance);
    }

    /** 发起人撤回审批中的流程：实例置为已撤回，待办任务同时取消。 */
    @Transactional
    public void cancel(Long instanceId) {
        Long userId = currentUserId();
        OaProcessInstance instance = instanceMapper.selectById(instanceId);
        if (instance == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "流程实例不存在: " + instanceId);
        }
        if (!Objects.equals(instance.getApplicantUserId(), userId)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "只能撤回本人发起的流程");
        }
        if (!INSTANCE_RUNNING.equals(instance.getInstanceStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "仅审批中的流程可撤回");
        }
        if (!configBoolean("oa.workflow.allow.revoke", true)) {
            throw new BusinessException(ResultCode.FORBIDDEN, "当前配置不允许撤回流程");
        }
        String currentNodeCode = instance.getCurrentNodeCode();
        List<OaTask> cancelledTasks = cancelPendingTasks(instanceId, null);
        instance.setInstanceStatus(INSTANCE_CANCELLED);
        instance.setCurrentNodeCode(null);
        instance.setFinishedAt(LocalDateTime.now());
        instanceMapper.updateById(instance);
        writeRecord(instanceId, null, currentNodeCode, null, userId, resolveDisplayName(userId),
                ACTION_CANCEL, "发起人撤回");
        notifyCancelled(instance, cancelledTasks);
        publishIfFinal(instance);
    }

    /**
     * 流程进入终态（已通过 / 已驳回 / 已撤回）后发布事件，业务模块据此回写单据状态。
     * 事件默认同步投递，与流程流转处于同一事务，业务回写失败会一并回滚，避免状态不一致。
     */
    private void publishIfFinal(OaProcessInstance instance) {
        String status = instance.getInstanceStatus();
        if (INSTANCE_APPROVED.equals(status)
                || INSTANCE_REJECTED.equals(status)
                || INSTANCE_CANCELLED.equals(status)) {
            eventPublisher.publishEvent(new WorkflowInstanceEvent(instance.getId(), instance.getInstanceNo(),
                    instance.getProcessCode(), instance.getBusinessKey(), status));
        }
    }

    public List<OaTaskRecord> listRecords(Long instanceId) {
        return taskRecordMapper.selectList(Wrappers.<OaTaskRecord>lambdaQuery()
                .eq(OaTaskRecord::getInstanceId, instanceId)
                .orderByAsc(OaTaskRecord::getOperatedAt)
                .orderByAsc(OaTaskRecord::getId));
    }

    /**
     * 从指定下标开始按顺序流转：抄送节点写轨迹后继续，审批节点生成待办并停在此处；
     * 所有节点走完后实例置为已通过。
     */
    private void advance(OaProcessInstance instance, List<OaProcessNode> flowNodes, int startIndex) {
        for (int i = Math.max(startIndex, 0); i < flowNodes.size(); i++) {
            OaProcessNode node = flowNodes.get(i);
            List<Long> approvers = resolveApprovers(node, instance);
            if (NODE_TYPE_CC.equals(node.getNodeType())) {
                for (Long approver : approvers) {
                    writeRecord(instance.getId(), null, node.getNodeCode(), node.getNodeName(),
                            approver, resolveDisplayName(approver), ACTION_CC, "抄送");
                }
                continue;
            }
            if (approvers.isEmpty()) {
                // 未匹配到审批人：跳过该节点并留痕，便于管理员排查节点配置
                writeRecord(instance.getId(), null, node.getNodeCode(), node.getNodeName(),
                        null, null, ACTION_SKIP, "未匹配到审批人，节点自动跳过");
                continue;
            }
            instance.setCurrentNodeCode(node.getNodeCode());
            instance.setInstanceStatus(INSTANCE_RUNNING);
            instance.setFinishedAt(null);
            int dueHours = configInt("oa.workflow.task.due.hours", 48);
            for (Long approver : approvers) {
                OaTask task = new OaTask();
                task.setTaskNo(nextNo("OAT"));
                task.setInstanceId(instance.getId());
                task.setNodeCode(node.getNodeCode());
                task.setNodeName(node.getNodeName());
                task.setAssigneeUserId(approver);
                task.setAssigneeName(resolveDisplayName(approver));
                task.setTaskStatus(TASK_PENDING);
                task.setDueAt(LocalDateTime.now().plusHours(dueHours));
                taskMapper.insert(task);
                notifyTodo(instance, task);
            }
            return;
        }
        instance.setCurrentNodeCode(null);
        instance.setInstanceStatus(INSTANCE_APPROVED);
        instance.setFinishedAt(LocalDateTime.now());
    }

    /** 驳回流转：按 oa.workflow.reject.strategy 配置执行退回发起人 / 上一节点 / 开始节点。 */
    private void applyReject(OaProcessInstance instance, OaTask task) {
        String strategy = config("oa.workflow.reject.strategy", "BACK_TO_APPLICANT");
        List<OaProcessNode> flowNodes = flowNodes(instance.getProcessId());
        int index = indexOfNode(flowNodes, task.getNodeCode());

        if (REJECT_BACK_TO_START.equals(strategy)) {
            cancelPendingTasks(instance.getId(), task.getId());
            advance(instance, flowNodes, 0);
            instanceMapper.updateById(instance);
            return;
        }
        if (REJECT_BACK_TO_PREV.equals(strategy) && index > 0) {
            cancelPendingTasks(instance.getId(), task.getId());
            advance(instance, flowNodes, index - 1);
            instanceMapper.updateById(instance);
            return;
        }
        // 默认策略：退回发起人，流程结束为已驳回
        cancelPendingTasks(instance.getId(), null);
        instance.setInstanceStatus(INSTANCE_REJECTED);
        instance.setCurrentNodeCode(null);
        instance.setFinishedAt(LocalDateTime.now());
        instanceMapper.updateById(instance);
        notifyRejected(instance, task);
    }

    /** 解析节点审批人：按审批人类型解析用户集合，再按节点配置应用代理授权。 */
    private List<Long> resolveApprovers(OaProcessNode node, OaProcessInstance instance) {
        String approverType = StringUtils.hasText(node.getApproverType())
                ? node.getApproverType() : APPROVER_ROLE;
        List<Long> candidates;
        switch (approverType) {
            case APPROVER_USER -> candidates = parseIds(node.getApproverValue());
            case APPROVER_ROLE -> candidates = resolveUsersByRoles(parseIds(node.getApproverValue()));
            case APPROVER_PROCESS_STARTER -> candidates = Collections.singletonList(instance.getApplicantUserId());
            case APPROVER_APPLICANT_MANAGER, APPROVER_ORG_MANAGER ->
                    candidates = resolveManager(instance.getApplicantUserId());
            default -> candidates = Collections.emptyList();
        }
        List<Long> approvers = candidates.stream()
                .filter(Objects::nonNull)
                .distinct()
                .filter(this::isEnabledUser)
                .toList();
        if (node.getAllowDelegate() != null && node.getAllowDelegate() == 1) {
            approvers = approvers.stream()
                    .map(approver -> resolveDelegate(approver, instance.getProcessCode()))
                    .distinct()
                    .toList();
        }
        return approvers;
    }

    private List<Long> resolveUsersByRoles(List<Long> roleIds) {
        if (roleIds.isEmpty()) {
            return Collections.emptyList();
        }
        return userRoleMapper.selectList(Wrappers.<SysUserRole>lambdaQuery()
                        .in(SysUserRole::getRoleId, roleIds))
                .stream().map(SysUserRole::getUserId).distinct().toList();
    }

    /**
     * 解析申请人直属上级：取自员工档案的直属上级字段。
     * 说明：组织负责人（ORG_MANAGER）暂与直属上级同源，待业务方确认组织负责人字段后切换为组织维度。
     */
    private List<Long> resolveManager(Long userId) {
        if (userId == null) {
            return Collections.emptyList();
        }
        return employmentMapper.selectList(Wrappers.<SysEmployment>lambdaQuery()
                        .eq(SysEmployment::getUserId, userId))
                .stream()
                .map(SysEmployment::getManagerUserId)
                .filter(Objects::nonNull)
                .findFirst()
                .map(Collections::singletonList)
                .orElse(Collections.emptyList());
    }

    /** 按 OA-N2 代理授权规则自动转办：授权生效期内且覆盖该流程时，转给代理人。 */
    private Long resolveDelegate(Long userId, String processCode) {
        LocalDateTime now = LocalDateTime.now();
        return delegationMapper.selectList(Wrappers.<SysDelegation>lambdaQuery()
                        .eq(SysDelegation::getDelegatorUserId, userId)
                        .eq(SysDelegation::getDelegationStatus, DELEGATION_ACTIVE))
                .stream()
                .filter(delegation -> delegation.getStartAt() == null || !now.isBefore(delegation.getStartAt()))
                .filter(delegation -> delegation.getEndAt() == null || !now.isAfter(delegation.getEndAt()))
                .filter(delegation -> "ALL".equals(delegation.getApplyScope())
                        || ("PROCESS".equals(delegation.getApplyScope())
                        && Objects.equals(delegation.getProcessCode(), processCode)))
                .map(SysDelegation::getDelegateUserId)
                .filter(Objects::nonNull)
                .findFirst()
                .orElse(userId);
    }

    /** 取消未处理的待办任务，返回被取消的任务清单用于通知。 */
    private List<OaTask> cancelPendingTasks(Long instanceId, Long excludeTaskId) {
        List<OaTask> pendingTasks = taskMapper.selectList(Wrappers.<OaTask>lambdaQuery()
                .eq(OaTask::getInstanceId, instanceId)
                .eq(OaTask::getTaskStatus, TASK_PENDING));
        List<OaTask> cancelled = new ArrayList<>();
        for (OaTask pending : pendingTasks) {
            if (excludeTaskId != null && excludeTaskId.equals(pending.getId())) {
                continue;
            }
            pending.setTaskStatus(TASK_CANCELLED);
            pending.setHandledAt(LocalDateTime.now());
            taskMapper.updateById(pending);
            cancelled.add(pending);
        }
        return cancelled;
    }

    /** 生成待办通知：关联具体待办任务，便于从消息中心直接跳转到待办列表（OA-DEV-044）。 */
    private void notifyTodo(OaProcessInstance instance, OaTask task) {
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("processName", instance.getProcessName());
        variables.put("instanceNo", instance.getInstanceNo());
        variables.put("title", instance.getTitle());
        variables.put("dueAt", task.getDueAt() == null ? "" : task.getDueAt().format(DISPLAY_FORMATTER));
        notificationService.sendByTemplate(NotificationService.TEMPLATE_WORKFLOW_TODO,
                Collections.singletonList(task.getAssigneeUserId()), variables,
                NotificationService.BIZ_OA_TASK, task.getId(), instance.getInstanceNo(), "/oa/tasks");
    }

    /** 生成驳回通知：流程退回发起人时告知驳回人与驳回意见。 */
    private void notifyRejected(OaProcessInstance instance, OaTask task) {
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("processName", instance.getProcessName());
        variables.put("instanceNo", instance.getInstanceNo());
        variables.put("handlerName", task.getAssigneeName());
        variables.put("comment", StringUtils.hasText(task.getCommentText()) ? task.getCommentText() : "无");
        notificationService.sendByTemplate(NotificationService.TEMPLATE_WORKFLOW_REJECT,
                Collections.singletonList(instance.getApplicantUserId()), variables,
                NotificationService.BIZ_OA_PROCESS_INSTANCE, instance.getId(), instance.getInstanceNo(),
                "/oa/my-applications");
    }

    /** 生成撤回通知：流程撤回时告知被取消待办的处理人。 */
    private void notifyCancelled(OaProcessInstance instance, List<OaTask> cancelledTasks) {
        List<Long> assignees = cancelledTasks.stream()
                .map(OaTask::getAssigneeUserId)
                .filter(Objects::nonNull)
                .toList();
        Map<String, Object> variables = new LinkedHashMap<>();
        variables.put("processName", instance.getProcessName());
        variables.put("instanceNo", instance.getInstanceNo());
        variables.put("applicantName", instance.getApplicantName());
        notificationService.sendByTemplate(NotificationService.TEMPLATE_WORKFLOW_CANCEL,
                assignees, variables, NotificationService.BIZ_OA_PROCESS_INSTANCE,
                instance.getId(), instance.getInstanceNo(), "/oa/tasks");
    }

    private void writeRecord(Long instanceId, Long taskId, String nodeCode, String nodeName,
                             Long operatorUserId, String operatorName, String action, String commentText) {
        OaTaskRecord record = new OaTaskRecord();
        record.setInstanceId(instanceId);
        record.setTaskId(taskId);
        record.setNodeCode(nodeCode);
        record.setNodeName(nodeName);
        record.setOperatorUserId(operatorUserId);
        record.setOperatorName(operatorName);
        record.setAction(action);
        record.setCommentText(commentText);
        record.setOperatedAt(LocalDateTime.now());
        taskRecordMapper.insert(record);
    }

    private List<OaProcessNode> flowNodes(Long processId) {
        return processNodeMapper.selectList(Wrappers.<OaProcessNode>lambdaQuery()
                .eq(OaProcessNode::getProcessId, processId)
                .ne(OaProcessNode::getNodeType, NODE_TYPE_START)
                .ne(OaProcessNode::getNodeType, NODE_TYPE_END)
                .orderByAsc(OaProcessNode::getSortNo));
    }

    private int indexOfNode(List<OaProcessNode> nodes, String nodeCode) {
        for (int i = 0; i < nodes.size(); i++) {
            if (Objects.equals(nodes.get(i).getNodeCode(), nodeCode)) {
                return i;
            }
        }
        return -1;
    }

    private boolean isEnabledUser(Long userId) {
        SysUser user = userMapper.selectById(userId);
        return user != null && (user.getStatus() == null || user.getStatus() == 1);
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

    private List<Long> parseIds(String value) {
        if (!StringUtils.hasText(value)) {
            return Collections.emptyList();
        }
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(StringUtils::hasText)
                .map(text -> {
                    try {
                        return Long.parseLong(text);
                    } catch (NumberFormatException e) {
                        return null;
                    }
                })
                .filter(Objects::nonNull)
                .distinct()
                .toList();
    }

    private String config(String key, String defaultValue) {
        String value = configService.getValue(key);
        return StringUtils.hasText(value) ? value : defaultValue;
    }

    private int configInt(String key, int defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        try {
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    private boolean configBoolean(String key, boolean defaultValue) {
        String value = configService.getValue(key);
        if (!StringUtils.hasText(value)) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.trim());
    }

    private Long currentUserId() {
        Long userId = UserContext.getUserId();
        if (userId == null) {
            throw new BusinessException(ResultCode.UNAUTHORIZED, "未获取到当前登录用户");
        }
        return userId;
    }

    private String nextNo(String prefix) {
        int sequence = SECOND_SEQUENCE.updateAndGet(value -> value >= 999 ? 1 : value + 1);
        return prefix + LocalDateTime.now().format(NO_FORMATTER)
                + String.format("%03d", sequence)
                + String.format("%03d", ThreadLocalRandom.current().nextInt(1000));
    }
}
