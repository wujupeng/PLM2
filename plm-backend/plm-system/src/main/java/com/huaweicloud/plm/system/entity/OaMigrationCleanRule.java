package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据清洗规则（OA-DEV-098）：重复用户、无效组织、缺失附件、异常日期、孤儿记录与不合法状态的清洗规则。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_migration_clean_rule")
public class OaMigrationCleanRule extends BaseEntity {

    /** 规则编号。 */
    private String ruleNo;

    /** 规则名称。 */
    private String ruleName;

    /** 对象编码。 */
    private String objectCode;

    /** 规则类型：DEDUP_USER/INVALID_ORG/MISSING_ATTACH/BAD_DATE/ORPHAN/ILLEGAL_STATUS。 */
    private String ruleType;

    /** 规则表达式。 */
    private String ruleExpr;

    /** 处理动作。 */
    private String action;

    /** 优先级。 */
    private Integer priority;

    /** 命中条数。 */
    private Long hitCount;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
