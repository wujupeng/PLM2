package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 质量问题关闭请求。
 */
@Data
public class QualityIssueCloseRequest {

    /** 验证结果。 */
    private String verifyResult;

    /** 备注。 */
    private String remark;

    /** 临时措施，可选。 */
    private String tempAction;

    /** 根因分析，可选。 */
    private String rootCause;

    /** 永久措施，可选。 */
    private String permanentAction;
}
