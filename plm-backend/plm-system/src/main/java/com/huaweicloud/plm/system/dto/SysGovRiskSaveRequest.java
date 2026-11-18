package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 治理风险保存请求（G1-N7 治理中心 T001 项目治理）。
 */
@Data
public class SysGovRiskSaveRequest {

    /** 风险编号（为空时自动生成）。 */
    private String riskNo;

    /** 所属项目编码。 */
    @NotBlank(message = "所属项目编码不能为空")
    private String projectCode;

    /** 风险标题。 */
    @NotBlank(message = "风险标题不能为空")
    private String riskTitle;

    /** 风险类型，为空默认 RISK。 */
    private String riskType;

    /** 风险等级，为空默认 MEDIUM。 */
    private String riskLevel;

    /** 发生概率。 */
    private String probability;

    /** 影响程度。 */
    private String impact;

    /** 缓解措施。 */
    private String mitigation;

    /** 风险状态，为空默认 OPEN。 */
    private String riskStatus;

    /** 负责人。 */
    private String ownerName;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
