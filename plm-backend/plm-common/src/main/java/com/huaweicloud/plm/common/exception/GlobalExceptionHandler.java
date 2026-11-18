package com.huaweicloud.plm.common.exception;

import com.huaweicloud.plm.common.api.ApiResponse;
import com.huaweicloud.plm.common.api.ResultCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.util.stream.Collectors;

/**
 * 全局异常处理，保证所有异常都以统一响应体返回。
 * <p>
 * HTTP 状态码统一保持 200，业务结果由响应体 code 表达；同时把业务 code/message 写入请求属性，
 * 供审计日志记录真实的成功/失败结果（异常被本类处理后，拦截器的 afterCompletion 收到的异常为 null）。
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    /** 业务异常码在请求中的属性名，供审计日志读取 */
    public static final String ERROR_CODE_ATTRIBUTE = "plm.request.errorCode";

    /** 业务异常信息在请求中的属性名，供审计日志读取 */
    public static final String ERROR_MESSAGE_ATTRIBUTE = "plm.request.errorMessage";

    @ExceptionHandler(BusinessException.class)
    public ApiResponse<Void> handleBusinessException(BusinessException ex, HttpServletRequest request) {
        log.warn("业务异常: code={}, message={}", ex.getCode(), ex.getMessage());
        return failure(request, ex.getCode(), ex.getMessage());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                          HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return failure(request, ResultCode.BAD_REQUEST.getCode(), message);
    }

    @ExceptionHandler(BindException.class)
    public ApiResponse<Void> handleBindException(BindException ex, HttpServletRequest request) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return failure(request, ResultCode.BAD_REQUEST.getCode(), message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ApiResponse<Void> handleConstraintViolation(ConstraintViolationException ex,
                                                       HttpServletRequest request) {
        String message = ex.getConstraintViolations().stream()
                .map(ConstraintViolation::getMessage)
                .collect(Collectors.joining("; "));
        return failure(request, ResultCode.BAD_REQUEST.getCode(), message);
    }

    @ExceptionHandler({MissingServletRequestParameterException.class, MethodArgumentTypeMismatchException.class,
            HttpMessageNotReadableException.class})
    public ApiResponse<Void> handleBadRequest(Exception ex, HttpServletRequest request) {
        log.warn("请求参数异常: {}", ex.getMessage());
        return failure(request, ResultCode.BAD_REQUEST.getCode(), "请求参数不合法");
    }

    @ExceptionHandler(NoHandlerFoundException.class)
    public ApiResponse<Void> handleNoHandlerFound(NoHandlerFoundException ex, HttpServletRequest request) {
        return failure(request, ResultCode.NOT_FOUND.getCode(), "接口不存在: " + ex.getRequestURL());
    }

    @ExceptionHandler(Exception.class)
    public ApiResponse<Void> handleException(Exception ex, HttpServletRequest request) {
        log.error("系统异常", ex);
        return failure(request, ResultCode.ERROR.getCode(), "系统内部错误，请联系管理员");
    }

    private ApiResponse<Void> failure(HttpServletRequest request, int code, String message) {
        request.setAttribute(ERROR_CODE_ATTRIBUTE, code);
        request.setAttribute(ERROR_MESSAGE_ATTRIBUTE, message);
        return ApiResponse.failure(code, message);
    }
}
