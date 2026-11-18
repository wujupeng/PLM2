package com.huaweicloud.plm.system.dto;

import lombok.Data;

/** 安全问题整改请求（N9，DEV-102）。 */
@Data
public class IntSecurityIssueFixRequest {

    /** 整改方案。 */
    private String fixPlan;

    /** 状态（留空默认 FIXED）。 */
    private String status;
}
