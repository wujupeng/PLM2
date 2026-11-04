package com.huaweicloud.plm.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    private int code;
    private String message;
    private T data;
    private String traceId;
    private Instant timestamp;

    private ApiResponse(int code, String message, T data, String traceId) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.traceId = traceId;
        this.timestamp = Instant.now();
    }

    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(200, "success", data, null);
    }

    public static <T> ApiResponse<T> success(T data, String traceId) {
        return new ApiResponse<>(200, "success", data, traceId);
    }

    public static <T> ApiResponse<T> success() {
        return new ApiResponse<>(200, "success", null, null);
    }

    public static <T> ApiResponse<T> fail(int code, String message) {
        return new ApiResponse<>(code, message, null, null);
    }

    public static <T> ApiResponse<T> fail(int code, String message, String traceId) {
        return new ApiResponse<>(code, message, null, traceId);
    }

    public boolean isSuccess() {
        return this.code == 200;
    }
}