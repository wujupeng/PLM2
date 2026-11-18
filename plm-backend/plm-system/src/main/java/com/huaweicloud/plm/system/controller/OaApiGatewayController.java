package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizApiAccessLogSaveRequest;
import com.huaweicloud.plm.system.dto.BizApiCredentialSaveRequest;
import com.huaweicloud.plm.system.dto.BizApiPolicySaveRequest;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.entity.OaApiAccessLog;
import com.huaweicloud.plm.system.entity.OaApiCredential;
import com.huaweicloud.plm.system.entity.OaApiPolicy;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaApiGatewayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

/**
 * 统一 API 网关接口（OA-DEV-086）：策略、凭证、访问审计、凭证到期与总览。
 */
@RestController
@RequestMapping("/oa/integration/gateway")
@RequiredArgsConstructor
public class OaApiGatewayController {

    private final OaApiGatewayService gatewayService;

    // ================= 策略 =================

    @GetMapping("/policies")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<PageResult<OaApiPolicy>> pagePolicies(OaIntegrationQuery query) {
        return ApiResponse.success(gatewayService.pagePolicies(query));
    }

    @GetMapping("/policies/enabled")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<List<OaApiPolicy>> listEnabledPolicies() {
        return ApiResponse.success(gatewayService.listEnabledPolicies());
    }

    @GetMapping("/policies/{id}")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<OaApiPolicy> detailPolicy(@PathVariable Long id) {
        return ApiResponse.success(gatewayService.detailPolicy(id));
    }

    @PostMapping("/policies")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Long> createPolicy(@Valid @RequestBody BizApiPolicySaveRequest request) {
        return ApiResponse.success(gatewayService.savePolicy(null, request));
    }

    @PutMapping("/policies/{id}")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Void> updatePolicy(@PathVariable Long id, @Valid @RequestBody BizApiPolicySaveRequest request) {
        gatewayService.savePolicy(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/policies/{id}")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Void> deletePolicy(@PathVariable Long id) {
        gatewayService.deletePolicy(id);
        return ApiResponse.success();
    }

    // ================= 凭证 =================

    @GetMapping("/credentials")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<PageResult<OaApiCredential>> pageCredentials(OaIntegrationQuery query) {
        return ApiResponse.success(gatewayService.pageCredentials(query));
    }

    /** 即将到期凭证。 */
    @GetMapping("/credentials/expiring")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<List<OaApiCredential>> listExpiringCredentials() {
        return ApiResponse.success(gatewayService.listExpiringCredentials());
    }

    @GetMapping("/credentials/{id}")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<OaApiCredential> detailCredential(@PathVariable Long id) {
        return ApiResponse.success(gatewayService.detailCredential(id));
    }

    @PostMapping("/credentials")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Long> createCredential(@Valid @RequestBody BizApiCredentialSaveRequest request) {
        return ApiResponse.success(gatewayService.saveCredential(null, request));
    }

    @PutMapping("/credentials/{id}")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Void> updateCredential(@PathVariable Long id, @Valid @RequestBody BizApiCredentialSaveRequest request) {
        gatewayService.saveCredential(id, request);
        return ApiResponse.success();
    }

    @DeleteMapping("/credentials/{id}")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Void> deleteCredential(@PathVariable Long id) {
        gatewayService.deleteCredential(id);
        return ApiResponse.success();
    }

    // ================= 访问审计 =================

    @GetMapping("/access-logs")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<PageResult<OaApiAccessLog>> pageAccessLogs(OaIntegrationQuery query) {
        return ApiResponse.success(gatewayService.pageAccessLogs(query));
    }

    @GetMapping("/access-logs/stats")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<Map<String, Object>> accessLogStats(OaIntegrationQuery query) {
        return ApiResponse.success(gatewayService.accessLogStats(query));
    }

    @GetMapping("/access-logs/{id}")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<OaApiAccessLog> detailAccessLog(@PathVariable Long id) {
        return ApiResponse.success(gatewayService.detailAccessLog(id));
    }

    @PostMapping("/access-logs")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Long> recordAccessLog(@Valid @RequestBody BizApiAccessLogSaveRequest request) {
        return ApiResponse.success(gatewayService.recordAccessLog(request));
    }

    @DeleteMapping("/access-logs/{id}")
    @RequirePermission("oa:integration:api:manage")
    public ApiResponse<Void> deleteAccessLog(@PathVariable Long id) {
        gatewayService.deleteAccessLog(id);
        return ApiResponse.success();
    }

    // ================= 总览 =================

    @GetMapping("/overview")
    @RequirePermission("oa:integration:api:list")
    public ApiResponse<Map<String, Object>> overview() {
        return ApiResponse.success(gatewayService.overview());
    }
}
