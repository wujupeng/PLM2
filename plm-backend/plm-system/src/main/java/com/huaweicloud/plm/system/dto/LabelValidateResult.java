package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 标签校验结果（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class LabelValidateResult {

    /** 是否通过校验。 */
    private Boolean valid;

    /** 标签类型。 */
    private String labelType;

    /** 命中的规则编码。 */
    private String ruleCode;

    /** 校验信息。 */
    private String message;
}
