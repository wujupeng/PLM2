package com.huaweicloud.plm.common.exception;

import lombok.Getter;

@Getter
public class BusinessException extends RuntimeException {

    private final int code;
    private final String module;

    public BusinessException(String module, int code, String message) {
        super(message);
        this.module = module;
        this.code = code;
    }

    public BusinessException(String module, int code, String message, Throwable cause) {
        super(message, cause);
        this.module = module;
        this.code = code;
    }

    public String getFullCode() {
        return this.module + "-" + this.code;
    }
}