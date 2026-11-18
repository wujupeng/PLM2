package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 审批流定义（G1-N6 公共平台底座—通用能力 WBS T103 可配置审批）：
 * 按单据类型与业务模块登记一条流程，priority 决定多条流程命中时的优先级，
 * conditionExpr 保存可读条件表达式便于人工核查，具体判定由审批条件（sys_approval_condition）驱动。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_approval_flow")
public class SysApprovalFlow extends BaseEntity {

    /** 审批流编号（唯一，支持人工指定）。 */
    private String flowNo;

    /** 流程编码，供审批条件/节点/实例按流程关联。 */
    private String flowCode;

    /** 流程名称。 */
    private String flowName;

    /** 单据类型。 */
    private String docType;

    /** 业务模块。 */
    private String bizModule;

    /** 条件表达式（可读文本，便于人工核查）。 */
    private String conditionExpr;

    /** 优先级，数值越大越优先，默认 0。 */
    private Integer priority;

    /** 流程状态：ACTIVE/DISABLED，默认 ACTIVE。 */
    private String flowStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
