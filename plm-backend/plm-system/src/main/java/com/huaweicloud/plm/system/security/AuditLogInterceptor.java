package com.huaweicloud.plm.system.security;

import com.huaweicloud.plm.common.api.ResultCode;
import com.huaweicloud.plm.common.exception.GlobalExceptionHandler;
import com.huaweicloud.plm.common.security.UserContext;
import com.huaweicloud.plm.common.web.TraceIdFilter;
import com.huaweicloud.plm.system.entity.SysAuditLog;
import com.huaweicloud.plm.system.service.AuditLogService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Set;

/**
 * 审计日志拦截器：记录所有写操作的请求方、目标、结果与耗时。
 */
@Component
@RequiredArgsConstructor
public class AuditLogInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTRIBUTE = "plm.audit.startTime";
    private static final Set<String> AUDITED_METHODS = Set.of("POST", "PUT", "PATCH", "DELETE");

    private final AuditLogService auditLogService;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        request.setAttribute(START_TIME_ATTRIBUTE, System.currentTimeMillis());
        return true;
    }

    @Override
    public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler,
                                Exception ex) {
        if (!AUDITED_METHODS.contains(request.getMethod())) {
            return;
        }
        Object startTime = request.getAttribute(START_TIME_ATTRIBUTE);
        long cost = startTime instanceof Long start ? System.currentTimeMillis() - start : 0L;

        // 被 @RestControllerAdvice 处理的异常不会传给 afterCompletion，因此优先读取异常处理器写入的业务结果
        Object errorCode = request.getAttribute(GlobalExceptionHandler.ERROR_CODE_ATTRIBUTE);
        Object errorMessage = request.getAttribute(GlobalExceptionHandler.ERROR_MESSAGE_ATTRIBUTE);
        int resultCode = errorCode instanceof Integer code ? code : response.getStatus();
        boolean success = ex == null && response.getStatus() < 400 && resultCode == ResultCode.SUCCESS.getCode();

        UserContext.Principal principal = UserContext.get();
        SysAuditLog auditLog = new SysAuditLog();
        auditLog.setTraceId(MDC.get(TraceIdFilter.MDC_TRACE_ID));
        auditLog.setUserId(principal == null ? null : principal.userId());
        auditLog.setUsername(principal == null ? "anonymous" : principal.username());
        auditLog.setModule(resolveModule(request.getRequestURI()));
        auditLog.setHttpMethod(request.getMethod());
        auditLog.setUri(request.getRequestURI());
        auditLog.setIp(resolveIp(request));
        auditLog.setRequestParams(StringUtils.hasText(request.getQueryString()) ? request.getQueryString() : "");
        auditLog.setResultCode(resultCode);
        auditLog.setSuccess(success ? 1 : 0);
        auditLog.setCostMs(cost);
        auditLog.setErrorMessage(resolveErrorMessage(ex, errorMessage));
        auditLogService.record(auditLog);
    }

    private String resolveErrorMessage(Exception ex, Object errorMessage) {
        if (ex != null) {
            return ex.getMessage();
        }
        return errorMessage instanceof String message ? message : null;
    }

    private String resolveModule(String uri) {
        String[] segments = uri.split("/");
        return segments.length > 1 ? segments[1] : uri;
    }

    private String resolveIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(forwarded)) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
