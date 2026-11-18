package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

/**
 * 编码规则保存请求。
 */
@Data
public class CodeRuleSaveRequest {

    @NotBlank(message = "编码规则编码不能为空")
    private String ruleCode;

    @NotBlank(message = "编码规则名称不能为空")
    private String ruleName;

    @NotBlank(message = "编码类型不能为空")
    private String codeType;

    /** 规则版本号，默认 V1。 */
    private String ruleVersion = "V1";

    /** 适用客户编码。 */
    private String customerCode;

    /** 适用项目编码。 */
    private String projectCode;

    /** 适用工厂编码。 */
    private String plantCode;

    @NotNull(message = "编码长度不能为空")
    private Integer totalLength;

    /** 流水号维度：NONE/DAY/MONTH/GLOBAL，默认 DAY。 */
    private String seqDimension = "DAY";

    /** 流水号起始值。 */
    private Integer seqStart;

    /** 流水号结束值。 */
    private Integer seqEnd;

    /** 流水号位数。 */
    private Integer seqLength;

    /** 是否默认规则：0 否 / 1 是。 */
    private Integer isDefault;

    /** 状态：draft/enabled/disabled。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 描述。 */
    private String description;

    private String remark;
}
