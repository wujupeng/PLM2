package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 编码规则头（DEV-051 / DEV-052 / DEV-062）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("code_rule")
public class CodeRule extends BaseEntity {

    /** 编码规则编码（唯一规则编码）。 */
    private String ruleCode;

    /** 编码规则名称。 */
    private String ruleName;

    /** 编码类型：CODE14/CODE24/CODE28。 */
    private String codeType;

    /** 规则版本号，默认 V1。 */
    private String ruleVersion;

    /** 适用客户编码。 */
    private String customerCode;

    /** 适用项目编码。 */
    private String projectCode;

    /** 适用工厂编码。 */
    private String plantCode;

    /** 编码总长度。 */
    private Integer totalLength;

    /** 流水号维度：NONE/DAY/MONTH/GLOBAL。 */
    private String seqDimension;

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
