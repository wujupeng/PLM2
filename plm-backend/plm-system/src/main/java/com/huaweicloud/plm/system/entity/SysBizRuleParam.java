package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 规则参数（G1-N6 公共平台底座—通用能力 WBS T104 业务规则引擎）：
 * 结构化登记业务规则的可配置参数（键、值、值类型），避免各系统把阈值硬编码在代码里，参数变更无需改代码。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_biz_rule_param")
public class SysBizRuleParam extends BaseEntity {

    /** 参数编号（唯一，支持人工指定）。 */
    private String paramNo;

    /** 所属规则编码。 */
    private String ruleCode;

    /** 参数键。 */
    private String paramKey;

    /** 参数名称。 */
    private String paramName;

    /** 参数值（字符串存储，按 valueType 解释）。 */
    private String paramValue;

    /** 值类型：STRING/NUMBER/BOOLEAN/LIST，默认 STRING。 */
    private String valueType;

    /** 排序号，默认 0。 */
    private Integer seqNo;

    /** 参数状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String paramStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
