package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更申请（ECR）保存请求。
 */
@Data
public class EcrSaveRequest {

    @NotBlank(message = "变更标题不能为空")
    private String title;

    /** 来源类型：internal/customer/quality/supplier，为空时默认 internal。 */
    private String sourceType;

    /** 来源单据引用。 */
    private String sourceRef;

    /** 变更原因。 */
    private String reason;

    /** 风险等级：low/middle/high。 */
    private String riskLevel;

    /** 紧急程度：normal/urgent/emergency。 */
    private String urgency;

    /** 受影响产品，多个以逗号分隔。 */
    private String affectedProducts;

    /** 受影响物料，多个以逗号分隔。 */
    private String affectedMaterials;

    /** 受影响图文档，多个以逗号分隔。 */
    private String affectedDocuments;

    /** 受影响工艺，多个以逗号分隔。 */
    private String affectedProcesses;

    private String remark;
}
