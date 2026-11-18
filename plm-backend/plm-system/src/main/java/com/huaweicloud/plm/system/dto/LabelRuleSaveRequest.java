package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 标签校验规则保存请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class LabelRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 标签类型：MATERIAL/PRODUCT/BOX/WAREHOUSE，为空默认 MATERIAL。 */
    private String labelType;

    /** 校验类型：FORMAT/CHECKSUM/LENGTH/PREFIX，为空默认 FORMAT。 */
    private String checkType;

    /** 条码模式：正则（FORMAT）或前缀（PREFIX）。 */
    private String barcodePattern;

    /** 期望长度（LENGTH 校验）。 */
    private Integer expectedLength;

    /** 异常级别：ERROR/WARN，为空默认 ERROR。 */
    private String errorLevel;

    /** 规则状态：ACTIVE/DISABLED，为空默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
