package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 规则执行日志（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 记录规则每次被求值的输入、输出与命中结果及耗时，供规则效果分析与问题追溯，日志只追加不修改。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_biz_rule_log")
public class SysBizRuleLog extends BaseEntity {

    /** 日志编号（唯一，支持人工指定）。 */
    private String logNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 业务模块。 */
    private String bizModule;

    /** 业务主键。 */
    private String bizKey;

    /** 输入数据（JSON 字符串）。 */
    private String inputData;

    /** 输出数据（JSON 字符串）。 */
    private String outputData;

    /** 命中结果：MATCH/NOT_MATCH/ERROR，默认 MATCH。 */
    private String matchResult;

    /** 执行耗时（毫秒），默认 0。 */
    private Integer costMs;

    /** 执行时间。 */
    private LocalDateTime execTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
