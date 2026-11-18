package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 规则参数保存请求（G1-N6 WBS T104 业务规则引擎）。
 */
@Data
public class SysBizRuleParamSaveRequest {

    /** 参数编号（为空时自动生成）。 */
    private String paramNo;

    /** 所属规则编码。 */
    @NotBlank(message = "规则编码不能为空")
    private String ruleCode;

    /** 参数键。 */
    @NotBlank(message = "参数键不能为空")
    private String paramKey;

    /** 参数名称。 */
    private String paramName;

    /** 参数值（字符串存储，按 valueType 解释）。 */
    private String paramValue;

    /** 值类型：STRING/NUMBER/BOOLEAN/LIST，为空默认 STRING。 */
    private String valueType;

    /** 排序号，为空默认 0。 */
    private Integer seqNo;

    /** 参数状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String paramStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
