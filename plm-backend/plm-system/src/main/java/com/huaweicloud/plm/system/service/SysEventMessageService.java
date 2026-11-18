package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventMessageSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventMessage;
import com.huaweicloud.plm.system.mapper.SysEventMessageMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 事件消息（G1-N1 集成平台 WBS T009）：事件发布、投递结果、重试与死信标记维护。
 * 重试上限与重试间隔取自可配置项，超过最大重试次数后转入死信。
 */
@Service
@RequiredArgsConstructor
public class SysEventMessageService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_SENT = "SENT";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_DEAD_LETTER = "DEAD_LETTER";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysEventMessageMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysEventMessage> pageMessages(IntegrationQuery query) {
        Page<SysEventMessage> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysEventMessage>lambdaQuery()
                .eq(StringUtils.hasText(query.getMessageStatus()),
                        SysEventMessage::getMessageStatus, query.getMessageStatus())
                .ge(StringUtils.hasText(query.getStartDate()),
                        SysEventMessage::getCreatedAt, OaBizFlowSupport.startOfDay(query.getStartDate()))
                .le(StringUtils.hasText(query.getEndDate()),
                        SysEventMessage::getCreatedAt, OaBizFlowSupport.endOfDay(query.getEndDate()))
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysEventMessage::getMessageKey, query.getKeyword()).or()
                        .like(SysEventMessage::getTopicCode, query.getKeyword()).or()
                        .like(SysEventMessage::getBizType, query.getKeyword()).or()
                        .like(SysEventMessage::getBizId, query.getKeyword()).or()
                        .like(SysEventMessage::getIdempotentKey, query.getKeyword()))
                .orderByDesc(SysEventMessage::getId));
        return PageResult.of(page);
    }

    public SysEventMessage detail(Long id) {
        return requireMessage(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysEventMessageSaveRequest request) {
        SysEventMessage entity;
        if (id == null) {
            entity = new SysEventMessage();
            entity.setMessageKey(StringUtils.hasText(request.getMessageKey())
                    ? request.getMessageKey() : flowSupport.nextBizNo("MSG"));
            entity.setMessageStatus(StringUtils.hasText(request.getMessageStatus())
                    ? request.getMessageStatus() : STATUS_PENDING);
            entity.setRetryCount(request.getRetryCount() != null ? request.getRetryCount() : 0);
            entity.setMaxRetry(request.getMaxRetry() != null
                    ? request.getMaxRetry() : flowSupport.configInt("integration.retry.max_times", 5));
            entity.setDeadLetter(request.getDeadLetter() != null ? request.getDeadLetter() : 0);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireMessage(id);
            if (StringUtils.hasText(request.getMessageKey())) {
                entity.setMessageKey(request.getMessageKey());
            }
            if (StringUtils.hasText(request.getMessageStatus())) {
                entity.setMessageStatus(request.getMessageStatus());
            }
            if (request.getRetryCount() != null) {
                entity.setRetryCount(request.getRetryCount());
            }
            if (request.getMaxRetry() != null) {
                entity.setMaxRetry(request.getMaxRetry());
            }
            if (request.getDeadLetter() != null) {
                entity.setDeadLetter(request.getDeadLetter());
            }
        }
        entity.setTopicCode(request.getTopicCode());
        entity.setSubscriptionCode(request.getSubscriptionCode());
        entity.setBizType(request.getBizType());
        entity.setBizId(request.getBizId());
        entity.setPayload(request.getPayload());
        entity.setNextRetryAt(parseTimestamp(request.getNextRetryAt()));
        entity.setPublishedAt(parseTimestamp(request.getPublishedAt()));
        entity.setDeliveredAt(parseTimestamp(request.getDeliveredAt()));
        entity.setErrorMessage(request.getErrorMessage());
        entity.setIdempotentKey(request.getIdempotentKey());
        entity.setOperatorName(request.getOperatorName());
        entity.setOrgName(request.getOrgName());
        entity.setRemark(request.getRemark());
        if (id == null) {
            mapper.insert(entity);
        } else {
            mapper.updateById(entity);
        }
        return entity.getId();
    }

    /** 发布消息：状态置为 SENT，发布时间为空时取当前时间，投递时间取当前时间，清空错误信息并复位死信标记。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventMessage publish(Long id) {
        SysEventMessage entity = requireMessage(id);
        LocalDateTime now = LocalDateTime.now();
        entity.setMessageStatus(STATUS_SENT);
        if (entity.getPublishedAt() == null) {
            entity.setPublishedAt(now);
        }
        entity.setDeliveredAt(now);
        entity.setErrorMessage(null);
        entity.setDeadLetter(0);
        mapper.updateById(entity);
        return entity;
    }

    /** 重试消息：重试次数加一，达到上限转入死信，否则置为失败并设置下次重试时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventMessage retry(Long id) {
        SysEventMessage entity = requireMessage(id);
        int retryCount = (entity.getRetryCount() == null ? 0 : entity.getRetryCount()) + 1;
        entity.setRetryCount(retryCount);
        int maxRetry = entity.getMaxRetry() != null
                ? entity.getMaxRetry() : flowSupport.configInt("integration.retry.max_times", 5);
        if (retryCount >= maxRetry) {
            entity.setMessageStatus(STATUS_DEAD_LETTER);
            entity.setDeadLetter(1);
            entity.setErrorMessage("重试超过最大次数，转入死信");
        } else {
            entity.setMessageStatus(STATUS_FAILED);
            int intervalSec = flowSupport.configInt("integration.retry.interval.seconds", 30);
            entity.setNextRetryAt(LocalDateTime.now().plusSeconds(intervalSec));
        }
        mapper.updateById(entity);
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireMessage(id);
        mapper.deleteById(id);
    }

    /** 事件消息统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("pending", mapper.selectCount(Wrappers.<SysEventMessage>lambdaQuery()
                .eq(SysEventMessage::getMessageStatus, STATUS_PENDING)));
        result.put("sent", mapper.selectCount(Wrappers.<SysEventMessage>lambdaQuery()
                .eq(SysEventMessage::getMessageStatus, STATUS_SENT)));
        result.put("failed", mapper.selectCount(Wrappers.<SysEventMessage>lambdaQuery()
                .eq(SysEventMessage::getMessageStatus, STATUS_FAILED)));
        result.put("deadLetterCount", mapper.selectCount(Wrappers.<SysEventMessage>lambdaQuery()
                .eq(SysEventMessage::getMessageStatus, STATUS_DEAD_LETTER)));
        List<SysEventMessage> all = mapper.selectList(null);
        int retryTotal = 0;
        for (SysEventMessage item : all) {
            retryTotal += item.getRetryCount() == null ? 0 : item.getRetryCount();
        }
        result.put("retryTotal", retryTotal);
        result.put("deadLetterFlagCount", mapper.selectCount(Wrappers.<SysEventMessage>lambdaQuery()
                .eq(SysEventMessage::getDeadLetter, 1)));
        result.put("retryMaxTimes", flowSupport.configInt("integration.retry.max_times", 5));
        return result;
    }

    public SysEventMessage requireMessage(Long id) {
        SysEventMessage entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "事件消息不存在: " + id);
        }
        return entity;
    }

    /** 解析时间字符串为 LocalDateTime，空白或非法返回 null。 */
    private LocalDateTime parseTimestamp(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        try {
            return LocalDateTime.parse(value.trim(), TS_FORMATTER);
        } catch (Exception e) {
            return null;
        }
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
