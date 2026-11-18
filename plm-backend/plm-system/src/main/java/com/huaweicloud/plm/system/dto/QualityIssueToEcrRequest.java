package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 质量问题转工程变更申请（ECR）请求，字段均可选，未提供时按问题单与配置回退。
 */
@Data
public class QualityIssueToEcrRequest {

    /** 变更标题，为空时使用“质量问题转变更：”+ 问题单号 + 问题标题。 */
    private String title;

    /** 变更原因，为空时使用问题描述。 */
    private String reason;

    /** 风险等级：low/middle/high，为空时按严重度映射。 */
    private String riskLevel;

    /** 紧急程度：normal/urgent/emergency，为空时默认 normal。 */
    private String urgency;

    /** 受影响产品，为空时带入问题单产品编码。 */
    private String affectedProducts;

    /** 受影响物料，为空时带入问题单物料编码。 */
    private String affectedMaterials;

    /** 受影响图文档。 */
    private String affectedDocuments;

    /** 受影响工艺。 */
    private String affectedProcesses;

    private String remark;
}
