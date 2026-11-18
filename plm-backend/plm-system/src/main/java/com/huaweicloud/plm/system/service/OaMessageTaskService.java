package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizMessageTaskSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaMessageTask;
import com.huaweicloud.plm.system.mapper.OaMessageTaskMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 消息总线与任务队列（OA-DEV-088）：异步任务登记、幂等键、执行、失败重试与死信。
 */
@Service
@RequiredArgsConstructor
public class OaMessageTaskService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_RUNNING = "RUNNING";
    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_DEAD = "DEAD";

    private final OaMessageTaskMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<OaMessageTask> page(OaIntegrationQuery query) {
        Page<OaMessageTask> page = query.toPage();
        mapper.selectPage(page, Wrappers.<OaMessageTask>lambdaQuery()
                .eq(StringUtils.hasText(query.getTaskType()), OaMessageTask::getTaskType, query.getTaskType())
                .eq(StringUtils.hasText(query.getTaskStatus()), OaMessageTask::getTaskStatus, query.getTaskStatus())
                .like(StringUtils.hasText(query.getBizKey()), OaMessageTask::getBizKey, query.getBizKey())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaMessageTask::getTaskNo, query.getKeyword()).or()
                        .like(OaMessageTask::getBizKey, query.getKeyword()).or()
                        .like(OaMessageTask::getIdempotentKey, query.getKeyword()))
                .orderByDesc(OaMessageTask::getId));
        return PageResult.of(page);
    }

    public OaMessageTask detail(Long id) {
        return requireEntity(id);
    }

    @Transactional
    public Long save(Long id, BizMessageTaskSaveRequest request) {
        if (!StringUtils.hasText(request.getTaskType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "任务类型不能为空");
        }
        if (StringUtils.hasText(request.getIdempotentKey()) && id == null) {
            Long exists = mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                    .eq(OaMessageTask::getIdempotentKey, request.getIdempotentKey()));
            if (exists != null && exists > 0) {
                throw new BusinessException(ResultCode.CONFLICT, "幂等键已存在，重复任务被拒绝: " + request.getIdempotentKey());
            }
        }
        OaMessageTask entity;
        if (id == null) {
            entity = new OaMessageTask();
            entity.setTaskNo(StringUtils.hasText(request.getTaskNo())
                    ? request.getTaskNo() : flowSupport.nextBizNo("MSG"));
            entity.setTaskStatus(STATUS_PENDING);
            entity.setAttemptCount(0);
            entity.setDeadFlag(0);
            entity.setOrgId(currentOrgId());
            entity.setNextExecuteTime(LocalDateTime.now());
        } else {
            entity = requireEntity(id);
            if (StringUtils.hasText(request.getTaskNo())) {
                entity.setTaskNo(request.getTaskNo());
            }
        }
        entity.setTaskType(request.getTaskType());
        entity.setBizKey(request.getBizKey());
        entity.setIdempotentKey(request.getIdempotentKey());
        entity.setPayload(request.getPayload());
        entity.setPriority(request.getPriority() != null ? request.getPriority() : 5);
        entity.setMaxRetry(request.getMaxRetry() != null ? request.getMaxRetry()
                : flowSupport.configInt("oa.integration.task.max.retry", 3));
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void delete(Long id) {
        requireEntity(id);
        mapper.deleteById(id);
    }

    /** 执行任务（模拟执行，success 决定成功或失败；达最大重试转死信）。 */
    @Transactional
    public OaMessageTask execute(Long id, boolean success) {
        OaMessageTask entity = requireEntity(id);
        if (STATUS_SUCCESS.equals(entity.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "任务已成功，不可重复执行");
        }
        if (STATUS_DEAD.equals(entity.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "任务已转死信，请先重新入队");
        }
        int attempt = (entity.getAttemptCount() == null ? 0 : entity.getAttemptCount()) + 1;
        entity.setAttemptCount(attempt);
        entity.setStartTime(LocalDateTime.now());
        entity.setFinishTime(LocalDateTime.now());
        if (success) {
            entity.setTaskStatus(STATUS_SUCCESS);
            entity.setLastError(null);
            entity.setDeadFlag(0);
        } else {
            entity.setLastError("模拟执行失败，第 " + attempt + " 次尝试");
            int maxRetry = entity.getMaxRetry() == null
                    ? flowSupport.configInt("oa.integration.task.max.retry", 3) : entity.getMaxRetry();
            if (attempt >= maxRetry) {
                entity.setTaskStatus(STATUS_DEAD);
                entity.setDeadFlag(1);
            } else {
                entity.setTaskStatus(STATUS_FAILED);
                entity.setNextExecuteTime(LocalDateTime.now().plusMinutes(1));
            }
        }
        mapper.updateById(entity);
        return entity;
    }

    /** 失败任务重新入队（死信任务需先经入队重置）。 */
    @Transactional
    public OaMessageTask retry(Long id) {
        OaMessageTask entity = requireEntity(id);
        if (STATUS_SUCCESS.equals(entity.getTaskStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "任务已成功，无需重新入队");
        }
        entity.setTaskStatus(STATUS_PENDING);
        entity.setAttemptCount(0);
        entity.setDeadFlag(0);
        entity.setLastError(null);
        entity.setStartTime(null);
        entity.setFinishTime(null);
        entity.setNextExecuteTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    /** 任务队列统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                .eq(OaMessageTask::getTaskStatus, STATUS_PENDING)));
        result.put("running", mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                .eq(OaMessageTask::getTaskStatus, STATUS_RUNNING)));
        result.put("success", mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                .eq(OaMessageTask::getTaskStatus, STATUS_SUCCESS)));
        result.put("failed", mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                .eq(OaMessageTask::getTaskStatus, STATUS_FAILED)));
        result.put("dead", mapper.selectCount(Wrappers.<OaMessageTask>lambdaQuery()
                .eq(OaMessageTask::getTaskStatus, STATUS_DEAD)));
        result.put("maxRetry", flowSupport.configInt("oa.integration.task.max.retry", 3));
        return result;
    }

    public OaMessageTask requireEntity(Long id) {
        OaMessageTask entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "消息任务不存在: " + id);
        }
        return entity;
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
