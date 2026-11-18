package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 质量问题措施验证请求。
 */
@Data
public class QualityIssueActionVerifyRequest {

    /** 验证结果。 */
    private String result;

    /** 验证证据。 */
    private String evidence;
}
