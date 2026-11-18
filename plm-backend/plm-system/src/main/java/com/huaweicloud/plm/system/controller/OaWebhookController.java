package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizWebhookDeliverySaveRequest;
import com.huaweicloud.plm.system.dto.BizWebhookSubscriptionSaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaWebhookDelivery;
import com.huaweicloud.plm.system.entity.OaWebhookSubscription;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaWebhookService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * Webhook 事件订阅接口（OA-DEV-087）：订阅、投递、测试、重试与死信。
 */
@RestController
@RequestMapping("/oa/integration")
@RequiredArgsConstructor
public class OaWebhookController {

    private final OaWebhookService webhookService;

    // ================= 订阅 =================

    @GetMapping("/webhooks")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<PageResult<OaWebhookSubscription>> pageSubscriptions(OaIntegrationQuery query) {
        return ApiResponse.success(webhookService.pageSubscriptions(query));
    }

    @GetMapping("/webhooks/enabled")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<List<OaWebhookSubscription>> listEnabledSubscriptions() {
        return ApiResponse.success(webhookService.listEnabledSubscriptions());
    }

    @GetMapping("/webhooks/{id}")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<OaWebhookSubscription> detailSubscription(@PathVariable Long id) {
        return ApiResponse.success(webhookService.detailSubscription(id));
    }

    @PostMapping("/webhooks")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Long> createSubscription(@Valid @RequestBody BizWebhookSubscriptionSaveRequest request) {
        return ApiResponse.success(webhookService.saveSubscription(null, request));
    }

    @PutMapping("/webhooks/{id}")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Void> updateSubscription(@PathVariable Long id, @Valid @RequestBody BizWebhookSubscriptionSaveRequest request) {
        webhookService.saveSubscription(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/webhooks/{id}")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Void> deleteSubscription(@PathVariable Long id) {
        webhookService.deleteSubscription(id);
        return ApiResponse.success();
    }

    /** 发起测试投递。 */
    @PostMapping("/webhooks/{id}/test")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Long> testDelivery(@PathVariable Long id,
                                          @RequestParam(required = false) String eventId,
                                          @RequestParam(required = false) String payload) {
        return ApiResponse.success(webhookService.testDelivery(id, eventId, payload));
    }

    // ================= 投递 =================

    @GetMapping("/webhook-deliveries")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<PageResult<OaWebhookDelivery>> pageDeliveries(OaIntegrationQuery query) {
        return ApiResponse.success(webhookService.pageDeliveries(query));
    }

    @GetMapping("/webhook-deliveries/stats")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<Map<String, Object>> stats() {
        return ApiResponse.success(webhookService.stats());
    }

    @GetMapping("/webhook-deliveries/{id}")
    @RequirePermission("oa:integration:webhook:list")
    public ApiResponse<OaWebhookDelivery> detailDelivery(@PathVariable Long id) {
        return ApiResponse.success(webhookService.detailDelivery(id));
    }

    @PostMapping("/webhook-deliveries")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Long> recordDelivery(@Valid @RequestBody BizWebhookDeliverySaveRequest request) {
        return ApiResponse.success(webhookService.recordDelivery(request));
    }

    /** 重试投递（仅失败且未转死信）。 */
    @PostMapping("/webhook-deliveries/{id}/retry")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Long> retryDelivery(@PathVariable Long id) {
        return ApiResponse.success(webhookService.retryDelivery(id));
    }

    @DeleteMapping("/webhook-deliveries/{id}")
    @RequirePermission("oa:integration:webhook:manage")
    public ApiResponse<Void> deleteDelivery(@PathVariable Long id) {
        webhookService.deleteDelivery(id);
        return ApiResponse.success();
    }
}
