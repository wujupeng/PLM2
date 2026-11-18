package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批条件（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 按「字段 + 比较符 + 比较值 + 逻辑连接」结构化登记，引擎按 seqNo 顺序与 logicType 计算是否命中流程，
 * 支持金额/物料类别/客户/供应商/工厂/风险等级等任意字段。比较符列避免保留字命名为 compareOperator。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_approval_condition")
public class SysApprovalCondition extends BaseEntity {

    /** 条件编号（唯一，支持人工指定）。 */
    private String conditionNo;

    /** 所属流程编码。 */
    private String flowCode;

    /** 判定顺序，数值越小越先评估，默认 0。 */
    private Integer seqNo;

    /** 字段标识（对应业务单据取值键）。 */
    private String fieldKey;

    /** 比较符：EQ/NE/GT/GE/LT/LE/IN/BETWEEN，默认 EQ。 */
    private String compareOperator;

    /** 比较值（IN 为逗号分隔集合，BETWEEN 形如 a,b）。 */
    private String compareValue;

    /** 逻辑连接：AND/OR，默认 AND。 */
    private String logicType;

    /** 条件状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String conditionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
