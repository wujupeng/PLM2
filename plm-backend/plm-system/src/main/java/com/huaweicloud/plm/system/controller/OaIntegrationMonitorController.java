package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.system.dto.OaIntegrationQuery;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaIntegrationMonitorService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 接口监控台接口（OA-DEV-094）：API/Webhook/消息任务/连接器同步/EDI 通知汇总指标。
 */
@RestController
@RequestMapping("/oa/integration/monitor")
@RequiredArgsConstructor
public class OaIntegrationMonitorController {

    private final OaIntegrationMonitorService monitorService;

    @GetMapping("/overview")
    @RequirePermission("oa:integration:monitor:list")
    public ApiResponse<Map<String, Object>> overview(OaIntegrationQuery query) {
        return ApiResponse.success(monitorService.overview(query));
    }
}
