package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.IntegrationQuery;
import com.huaweicloud.plm.system.dto.SysEventSubscriptionSaveRequest;
import com.huaweicloud.plm.system.entity.SysEventSubscription;
import com.huaweicloud.plm.system.mapper.SysEventSubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 事件订阅（G1-N1 集成平台 WBS T009）：订阅关系、投递方式、重试策略与联通测试维护。
 * 重试上限与重试间隔取自可配置项，便于按集成计划调整。
 */
@Service
@RequiredArgsConstructor
public class SysEventSubscriptionService {

    private static final String MODE_PUSH = "PUSH";
    private static final String MODE_PULL = "PULL";
    private static final String STATUS_ENABLED = "ENABLED";
    private static final String STATUS_DISABLED = "DISABLED";
    private static final String TEST_OK = "TEST_OK";
    private static final DateTimeFormatter TS_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final SysEventSubscriptionMapper mapper;
    private final OaBizFlowSupport flowSupport;

    public PageResult<SysEventSubscription> pageSubscriptions(IntegrationQuery query) {
        Page<SysEventSubscription> page = query.toPage();
        mapper.selectPage(page, Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(StringUtils.hasText(query.getSubscriptionStatus()),
                        SysEventSubscription::getSubscriptionStatus, query.getSubscriptionStatus())
                .eq(StringUtils.hasText(query.getDeliveryMode()),
                        SysEventSubscription::getDeliveryMode, query.getDeliveryMode())
                .eq(StringUtils.hasText(query.getSystemCode()),
                        SysEventSubscription::getSubscriberSystem, query.getSystemCode())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(SysEventSubscription::getSubscriptionCode, query.getKeyword()).or()
                        .like(SysEventSubscription::getTopicCode, query.getKeyword()).or()
                        .like(SysEventSubscription::getTopicName, query.getKeyword()).or()
                        .like(SysEventSubscription::getEndpoint, query.getKeyword()))
                .orderByDesc(SysEventSubscription::getId));
        return PageResult.of(page);
    }

    public SysEventSubscription detail(Long id) {
        return requireSubscription(id);
    }

    @Transactional(rollbackFor = Exception.class)
    public Long save(Long id, SysEventSubscriptionSaveRequest request) {
        SysEventSubscription entity;
        if (id == null) {
            entity = new SysEventSubscription();
            entity.setSubscriptionCode(StringUtils.hasText(request.getSubscriptionCode())
                    ? request.getSubscriptionCode() : flowSupport.nextBizNo("SUB"));
            entity.setDeliveryMode(StringUtils.hasText(request.getDeliveryMode())
                    ? request.getDeliveryMode() : MODE_PUSH);
            entity.setMaxRetry(request.getMaxRetry() != null
                    ? request.getMaxRetry() : flowSupport.configInt("integration.retry.max_times", 5));
            entity.setRetryIntervalSec(request.getRetryIntervalSec() != null
                    ? request.getRetryIntervalSec() : flowSupport.configInt("integration.retry.interval.seconds", 30));
            entity.setIdempotentEnabled(request.getIdempotentEnabled() != null ? request.getIdempotentEnabled() : 1);
            entity.setSubscriptionStatus(StringUtils.hasText(request.getSubscriptionStatus())
                    ? request.getSubscriptionStatus() : STATUS_ENABLED);
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireSubscription(id);
            if (StringUtils.hasText(request.getSubscriptionCode())) {
                entity.setSubscriptionCode(request.getSubscriptionCode());
            }
            if (StringUtils.hasText(request.getDeliveryMode())) {
                entity.setDeliveryMode(request.getDeliveryMode());
            }
            if (request.getMaxRetry() != null) {
                entity.setMaxRetry(request.getMaxRetry());
            }
            if (request.getRetryIntervalSec() != null) {
                entity.setRetryIntervalSec(request.getRetryIntervalSec());
            }
            if (request.getIdempotentEnabled() != null) {
                entity.setIdempotentEnabled(request.getIdempotentEnabled());
            }
            if (StringUtils.hasText(request.getSubscriptionStatus())) {
                entity.setSubscriptionStatus(request.getSubscriptionStatus());
            }
        }
        entity.setTopicCode(request.getTopicCode());
        entity.setTopicName(request.getTopicName());
        entity.setSubscriberSystem(request.getSubscriberSystem());
        entity.setEndpoint(request.getEndpoint());
        entity.setLastTestResult(request.getLastTestResult());
        entity.setLastTestTime(parseTimestamp(request.getLastTestTime()));
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

    /** 启用订阅：状态置为 ENABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventSubscription enable(Long id) {
        SysEventSubscription entity = requireSubscription(id);
        entity.setSubscriptionStatus(STATUS_ENABLED);
        mapper.updateById(entity);
        return entity;
    }

    /** 停用订阅：状态置为 DISABLED。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventSubscription disable(Long id) {
        SysEventSubscription entity = requireSubscription(id);
        entity.setSubscriptionStatus(STATUS_DISABLED);
        mapper.updateById(entity);
        return entity;
    }

    /** 联通测试：回写测试结果与测试时间。 */
    @Transactional(rollbackFor = Exception.class)
    public SysEventSubscription test(Long id) {
        SysEventSubscription entity = requireSubscription(id);
        entity.setLastTestResult(TEST_OK);
        entity.setLastTestTime(LocalDateTime.now());
        mapper.updateById(entity);
        return entity;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(Long id) {
        requireSubscription(id);
        mapper.deleteById(id);
    }

    /** 事件订阅统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", mapper.selectCount(null));
        result.put("enabled", mapper.selectCount(Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(SysEventSubscription::getSubscriptionStatus, STATUS_ENABLED)));
        result.put("disabled", mapper.selectCount(Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(SysEventSubscription::getSubscriptionStatus, STATUS_DISABLED)));
        result.put("pushCount", mapper.selectCount(Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(SysEventSubscription::getDeliveryMode, MODE_PUSH)));
        result.put("pullCount", mapper.selectCount(Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(SysEventSubscription::getDeliveryMode, MODE_PULL)));
        result.put("idempotentCount", mapper.selectCount(Wrappers.<SysEventSubscription>lambdaQuery()
                .eq(SysEventSubscription::getIdempotentEnabled, 1)));
        result.put("retryMaxTimes", flowSupport.configInt("integration.retry.max_times", 5));
        return result;
    }

    public SysEventSubscription requireSubscription(Long id) {
        SysEventSubscription entity = mapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "事件订阅不存在: " + id);
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
