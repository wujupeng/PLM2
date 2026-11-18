package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据质量规则（G1-N6 公共平台底座—通用能力 WBS T105 数据质量控制）：
 * 按目标实体登记校验类型（必填/唯一性/编码规则/有效期/版本一致性/引用完整性）、校验表达式与异常级别，
 * 供各业务系统在保存时统一校验。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_data_quality_rule")
public class SysDataQualityRule extends BaseEntity {

    /** 规则编号（唯一，支持人工指定）。 */
    private String ruleNo;

    /** 规则编码，供异常队列按规则关联。 */
    private String ruleCode;

    /** 规则名称。 */
    private String ruleName;

    /** 目标实体。 */
    private String targetEntity;

    /** 规则类型：REQUIRED/UNIQUE/CODE_PATTERN/VALIDITY/VERSION_CONSISTENCY/REFERENCE，默认 REQUIRED。 */
    private String ruleType;

    /** 校验表达式（可读文本，便于人工核查）。 */
    private String ruleExpr;

    /** 异常级别：ERROR 阻断/WARN 提示，默认 ERROR。 */
    private String errorLevel;

    /** 规则状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String ruleStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
