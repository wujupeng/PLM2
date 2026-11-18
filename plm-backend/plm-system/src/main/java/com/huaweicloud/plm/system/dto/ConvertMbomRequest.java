package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * EBOM 转 MBOM 请求（DEV-030）。
 */
@Data
public class ConvertMbomRequest {

    /** 目标版本号，为空时取源 BOM 版本号。 */
    private String targetVersionNo;

    private String description;

    private String remark;
}
