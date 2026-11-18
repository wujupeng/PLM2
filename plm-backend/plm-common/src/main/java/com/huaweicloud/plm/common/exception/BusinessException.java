package com.huaweicloud.plm.common.exception;

import com.huaweicloud.plm.common.api.ResultCode;
import lombok.Getter;

/**
 * 业务异常，携带统一状态码。
 */
@Getter
public class BusinessException extends RuntimeException {

    private final int code;

    public BusinessException(String message) {
        this(ResultCode.BAD_REQUEST, message);
    }

    public BusinessException(ResultCode resultCode) {
        this(resultCode, resultCode.getMessage());
    }

    public BusinessException(ResultCode resultCode, String message) {
        super(message);
        this.code = resultCode.getCode();
    }
}
