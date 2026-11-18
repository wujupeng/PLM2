package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 封箱请求（N8，DEV-089）。
 */
@Data
public class MfgPackageSealRequest {

    /** 操作人。 */
    private String operator;

    private String remark;
}
