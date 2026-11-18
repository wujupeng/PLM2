package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 质量问题转工程变更申请（ECR）结果。
 */
@Data
public class QualityIssueEcrResult {

    /** 生成的工程变更申请 ID。 */
    private Long ecrId;

    /** 生成的工程变更申请编号。 */
    private String ecrNo;

    /** 结果说明。 */
    private String message;
}
