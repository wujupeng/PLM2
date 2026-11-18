package com.huaweicloud.plm.system.controller;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.PageResult;
import com.huaweicloud.plm.system.dto.BizSysLogSaveRequest;
import com.huaweicloud.plm.system.dto.OaBizFlowQuery;
import com.huaweicloud.plm.system.entity.OaMobileSession;
import com.huaweicloud.plm.system.entity.OaSysLog;
import com.huaweicloud.plm.system.security.RequirePermission;
import com.huaweicloud.plm.system.service.OaBizFlowSupport;
import com.huaweicloud.plm.system.service.OaMobileSessionService;
import com.huaweicloud.plm.system.service.OaSysLogService;
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
 * 日志中心与移动后台接口（OA-DEV-085）：系统/业务日志、异常告警、移动设备会话管理。
 */
@RestController
@RequestMapping("/oa/system/log-center")
@RequiredArgsConstructor
public class OaLogCenterController {

    private final OaSysLogService sysLogService;
    private final OaMobileSessionService mobileSessionService;

    /** 日志分页。 */
    @GetMapping("/logs")
    @RequirePermission("oa:log:list")
    public ApiResponse<PageResult<OaSysLog>> pageLogs(OaBizFlowQuery query) {
        return ApiResponse.success(sysLogService.page(query));
    }

    /** 日志统计：按类型、级别与告警状态汇总。 */
    @GetMapping("/logs/stats")
    @RequirePermission("oa:log:list")
    public ApiResponse<Map<String, Long>> logStats(@RequestParam(required = false) String startDate,
                                                   @RequestParam(required = false) String endDate) {
        return ApiResponse.success(sysLogService.stats(
                OaBizFlowSupport.startOfDay(startDate),
                OaBizFlowSupport.endOfDay(endDate)));
    }

    @GetMapping("/logs/{id}")
    @RequirePermission("oa:log:list")
    public ApiResponse<OaSysLog> logDetail(@PathVariable Long id) {
        return ApiResponse.success(sysLogService.detail(id));
    }

    /** 登记日志：供业务模块与网关上报。 */
    @PostMapping("/logs")
    @RequirePermission("oa:log:manage")
    public ApiResponse<Long> recordLog(@Valid @RequestBody BizSysLogSaveRequest request) {
        return ApiResponse.success(sysLogService.record(request));
    }

    /** 处理告警。 */
    @PutMapping("/logs/{id}/handle-alert")
    @RequirePermission("oa:log:manage")
    public ApiResponse<Void> handleAlert(@PathVariable Long id, @RequestParam(required = false) String handleRemark) {
        sysLogService.handleAlert(id, handleRemark);
        return ApiResponse.success();
    }

    /** 清理过期日志。 */
    @DeleteMapping("/logs/cleanup")
    @RequirePermission("oa:log:manage")
    public ApiResponse<Long> cleanupLogs() {
        return ApiResponse.success(sysLogService.cleanupExpired());
    }

    /** 移动设备会话分页。 */
    @GetMapping("/sessions")
    @RequirePermission("oa:log:list")
    public ApiResponse<PageResult<OaMobileSession>> pageSessions(OaBizFlowQuery query) {
        return ApiResponse.success(mobileSessionService.page(query));
    }

    /** 查询某用户在线会话。 */
    @GetMapping("/sessions/active")
    @RequirePermission("oa:log:list")
    public ApiResponse<List<OaMobileSession>> activeSessions(@RequestParam Long userId) {
        return ApiResponse.success(mobileSessionService.listActiveByUser(userId));
    }

    @GetMapping("/sessions/{id}")
    @RequirePermission("oa:log:list")
    public ApiResponse<OaMobileSession> sessionDetail(@PathVariable Long id) {
        return ApiResponse.success(mobileSessionService.detail(id));
    }

    /** 注销会话。 */
    @PutMapping("/sessions/{id}/revoke")
    @RequirePermission("oa:log:manage")
    public ApiResponse<Void> revokeSession(@PathVariable Long id, @RequestParam(required = false) String reason) {
        mobileSessionService.revoke(id, reason);
        return ApiResponse.success();
    }

    /** 清理过期会话。 */
    @DeleteMapping("/sessions/expired")
    @RequirePermission("oa:log:manage")
    public ApiResponse<Long> expireSessions() {
        return ApiResponse.success(mobileSessionService.expireOutdated());
    }
}
