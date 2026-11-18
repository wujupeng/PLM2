package com.huaweicloud.plm.system.service;

import com.baomidou.mybatisplus.core.toolkit.Wrappers;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.BusinessException;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.system.dto.BizWebhookDeliverySaveRequest;
import com.huaweicloud.plm.system.dto.BizWebhookSubscriptionSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaWebhookDelivery;
import com.huaweicloud.plm.system.entity.OaWebhookSubscription;
import com.huaweicloud.plm.system.mapper.OaWebhookDeliveryMapper;
import com.huaweicloud.plm.system.mapper.OaWebhookSubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Webhook 事件订阅（OA-DEV-087）：订阅维护、签名密钥、投递记录、重试与死信机制。
 */
@Service
@RequiredArgsConstructor
public class OaWebhookService {

    private static final String STATUS_SUCCESS = "SUCCESS";
    private static final String STATUS_FAILED = "FAILED";
    private static final String STATUS_DEAD = "DEAD";

    private final OaWebhookSubscriptionMapper subscriptionMapper;
    private final OaWebhookDeliveryMapper deliveryMapper;
    private final OaBizFlowSupport flowSupport;

    // ================= 订阅 =================

    public PageResult<OaWebhookSubscription> pageSubscriptions(OaIntegrationQuery query) {
        Page<OaWebhookSubscription> page = query.toPage();
        subscriptionMapper.selectPage(page, Wrappers.<OaWebhookSubscription>lambdaQuery()
                .eq(query.getStatus() != null, OaWebhookSubscription::getStatus, query.getStatus())
                .eq(StringUtils.hasText(query.getEventType()), OaWebhookSubscription::getEventType, query.getEventType())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaWebhookSubscription::getSubscriptionNo, query.getKeyword()).or()
                        .like(OaWebhookSubscription::getSubscriptionName, query.getKeyword()).or()
                        .like(OaWebhookSubscription::getCallbackUrl, query.getKeyword()))
                .orderByDesc(OaWebhookSubscription::getId));
        return PageResult.of(page);
    }

    public OaWebhookSubscription detailSubscription(Long id) {
        return requireSubscription(id);
    }

    public List<OaWebhookSubscription> listEnabledSubscriptions() {
        return subscriptionMapper.selectList(Wrappers.<OaWebhookSubscription>lambdaQuery()
                .eq(OaWebhookSubscription::getStatus, 1)
                .orderByAsc(OaWebhookSubscription::getEventType));
    }

    @Transactional
    public Long saveSubscription(Long id, BizWebhookSubscriptionSaveRequest request) {
        if (!StringUtils.hasText(request.getSubscriptionName())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "订阅名称不能为空");
        }
        if (!StringUtils.hasText(request.getEventType())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "事件类型不能为空");
        }
        if (!StringUtils.hasText(request.getCallbackUrl())) {
            throw new BusinessException(ResultCode.BAD_REQUEST, "回调地址不能为空");
        }
        OaWebhookSubscription entity;
        if (id == null) {
            entity = new OaWebhookSubscription();
            entity.setSubscriptionNo(StringUtils.hasText(request.getSubscriptionNo())
                    ? request.getSubscriptionNo() : flowSupport.nextBizNo("WH"));
            entity.setOrgId(currentOrgId());
        } else {
            entity = requireSubscription(id);
            if (StringUtils.hasText(request.getSubscriptionNo())) {
                entity.setSubscriptionNo(request.getSubscriptionNo());
            }
        }
        entity.setSubscriptionName(request.getSubscriptionName());
        entity.setEventType(request.getEventType());
        entity.setCallbackUrl(request.getCallbackUrl());
        if (StringUtils.hasText(request.getSecret())) {
            entity.setSecret(request.getSecret());
        }
        entity.setOwnerSystem(request.getOwnerSystem());
        entity.setMaxRetry(request.getMaxRetry() != null ? request.getMaxRetry()
                : flowSupport.configInt("oa.integration.webhook.max.retry", 3));
        entity.setStatus(request.getStatus() != null ? request.getStatus() : 1);
        entity.setRemark(request.getRemark());
        if (id == null) {
            subscriptionMapper.insert(entity);
        } else {
            subscriptionMapper.updateById(entity);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteSubscription(Long id) {
        requireSubscription(id);
        subscriptionMapper.deleteById(id);
    }

    // ================= 投递 =================

    public PageResult<OaWebhookDelivery> pageDeliveries(OaIntegrationQuery query) {
        Page<OaWebhookDelivery> page = query.toPage();
        deliveryMapper.selectPage(page, Wrappers.<OaWebhookDelivery>lambdaQuery()
                .eq(query.getConnectorId() != null, OaWebhookDelivery::getSubscriptionId, query.getConnectorId())
                .eq(StringUtils.hasText(query.getEventType()), OaWebhookDelivery::getEventType, query.getEventType())
                .eq(StringUtils.hasText(query.getDeliveryStatus()), OaWebhookDelivery::getDeliveryStatus, query.getDeliveryStatus())
                .and(StringUtils.hasText(query.getKeyword()), w -> w
                        .like(OaWebhookDelivery::getEventId, query.getKeyword()).or()
                        .like(OaWebhookDelivery::getSubscriptionNo, query.getKeyword()).or()
                        .like(OaWebhookDelivery::getReceiptNo, query.getKeyword()))
                .orderByDesc(OaWebhookDelivery::getId));
        return PageResult.of(page);
    }

    public OaWebhookDelivery detailDelivery(Long id) {
        return requireDelivery(id);
    }

    /** 登记投递记录（用于接入侧回写投递结果）。 */
    @Transactional
    public Long recordDelivery(BizWebhookDeliverySaveRequest request) {
        OaWebhookSubscription subscription = requireSubscription(request.getSubscriptionId());
        OaWebhookDelivery entity = new OaWebhookDelivery();
        entity.setSubscriptionId(subscription.getId());
        entity.setSubscriptionNo(subscription.getSubscriptionNo());
        entity.setEventType(StringUtils.hasText(request.getEventType())
                ? request.getEventType() : subscription.getEventType());
        entity.setEventId(StringUtils.hasText(request.getEventId())
                ? request.getEventId() : flowSupport.nextBizNo("EVT"));
        entity.setPayload(request.getPayload());
        String status = StringUtils.hasText(request.getDeliveryStatus()) ? request.getDeliveryStatus() : STATUS_SUCCESS;
        entity.setDeliveryStatus(status);
        entity.setAttemptCount(STATUS_SUCCESS.equals(status) ? 1 : 1);
        entity.setMaxRetry(subscription.getMaxRetry());
        entity.setResponseCode(request.getResponseCode());
        entity.setLastError(request.getLastError());
        entity.setReceiptNo(StringUtils.hasText(request.getReceiptNo())
                ? request.getReceiptNo() : flowSupport.nextBizNo("RCP"));
        entity.setDeadFlag(isDead(status, entity.getAttemptCount(), entity.getMaxRetry()) ? 1 : 0);
        entity.setDeliveryTime(LocalDateTime.now());
        entity.setOrgId(currentOrgId());
        entity.setRemark(request.getRemark());
        deliveryMapper.insert(entity);
        refreshSubscriptionDelivery(subscription, status);
        return entity.getId();
    }

    /** 按订阅发起一次测试投递（模拟成功投递）。 */
    @Transactional
    public Long testDelivery(Long subscriptionId, String eventId, String payload) {
        BizWebhookDeliverySaveRequest request = new BizWebhookDeliverySaveRequest();
        request.setSubscriptionId(subscriptionId);
        request.setEventId(eventId);
        request.setPayload(payload);
        request.setDeliveryStatus(STATUS_SUCCESS);
        request.setResponseCode(200);
        return recordDelivery(request);
    }

    /** 重试投递：仅失败且未转死信的记录可重试（模拟重试成功）。 */
    @Transactional
    public Long retryDelivery(Long id) {
        OaWebhookDelivery entity = requireDelivery(id);
        if (STATUS_SUCCESS.equals(entity.getDeliveryStatus())) {
            throw new BusinessException(ResultCode.CONFLICT, "该投递已成功，无需重试");
        }
        if (STATUS_DEAD.equals(entity.getDeliveryStatus()) || Integer.valueOf(1).equals(entity.getDeadFlag())) {
            throw new BusinessException(ResultCode.CONFLICT, "该投递已转死信，不可自动重试，请人工处理");
        }
        int attempt = (entity.getAttemptCount() == null ? 0 : entity.getAttemptCount()) + 1;
        entity.setAttemptCount(attempt);
        entity.setDeliveryStatus(STATUS_SUCCESS);
        entity.setResponseCode(200);
        entity.setLastError(null);
        entity.setReceiptNo(flowSupport.nextBizNo("RCP"));
        entity.setDeliveryTime(LocalDateTime.now());
        entity.setDeadFlag(0);
        deliveryMapper.updateById(entity);
        OaWebhookSubscription subscription = subscriptionMapper.selectById(entity.getSubscriptionId());
        if (subscription != null) {
            refreshSubscriptionDelivery(subscription, STATUS_SUCCESS);
        }
        return entity.getId();
    }

    @Transactional
    public void deleteDelivery(Long id) {
        requireDelivery(id);
        deliveryMapper.deleteById(id);
    }

    /** 投递统计。 */
    public Map<String, Object> stats() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("total", deliveryMapper.selectCount(null));
        result.put("success", deliveryMapper.selectCount(Wrappers.<OaWebhookDelivery>lambdaQuery()
                .eq(OaWebhookDelivery::getDeliveryStatus, STATUS_SUCCESS)));
        result.put("failed", deliveryMapper.selectCount(Wrappers.<OaWebhookDelivery>lambdaQuery()
                .eq(OaWebhookDelivery::getDeliveryStatus, STATUS_FAILED)));
        result.put("dead", deliveryMapper.selectCount(Wrappers.<OaWebhookDelivery>lambdaQuery()
                .eq(OaWebhookDelivery::getDeliveryStatus, STATUS_DEAD)));
        result.put("deadThreshold", flowSupport.configInt("oa.integration.webhook.dead.threshold", 5));
        return result;
    }

    // ================= 辅助 =================

    public OaWebhookSubscription requireSubscription(Long id) {
        OaWebhookSubscription entity = subscriptionMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "Webhook 订阅不存在: " + id);
        }
        return entity;
    }

    public OaWebhookDelivery requireDelivery(Long id) {
        OaWebhookDelivery entity = deliveryMapper.selectById(id);
        if (entity == null) {
            throw new BusinessException(ResultCode.NOT_FOUND, "Webhook 投递记录不存在: " + id);
        }
        return entity;
    }

    private boolean isDead(String status, Integer attempt, Integer maxRetry) {
        if (STATUS_DEAD.equals(status)) {
            return true;
        }
        int threshold = flowSupport.configInt("oa.integration.webhook.dead.threshold",
                maxRetry == null ? 5 : maxRetry);
        return STATUS_FAILED.equals(status) && attempt != null && attempt >= threshold;
    }

    private void refreshSubscriptionDelivery(OaWebhookSubscription subscription, String status) {
        subscription.setLastDeliveryTime(LocalDateTime.now());
        subscription.setLastDeliveryStatus(status);
        subscriptionMapper.updateById(subscription);
    }

    private Long currentOrgId() {
        UserContext.Principal principal = UserContext.get();
        return principal == null ? null : principal.orgId();
    }
}
