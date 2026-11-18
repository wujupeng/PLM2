package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 扫码规则保存请求（对应 G3-N7a ERP 条码管理）。
 */
@Data
public class ErpBarcodeRuleSaveRequest {

    /** 规则编码。 */
    @NotBlank(message = "规则编码不能为空")
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 条码类型，为空默认 MATERIAL。 */
    private String barcodeType;

    /** 规则表达式。 */
    private String rulePattern;

    /** 扫码业务类型，为空默认 RECEIPT。 */
    private String scanBizType;

    /** 是否启用校验，0=否，为空默认 1。 */
    private Integer validateEnabled;

    /** 是否查重，0=否，为空默认 1。 */
    private Integer duplicateCheck;

    /** 规则状态，为空默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
