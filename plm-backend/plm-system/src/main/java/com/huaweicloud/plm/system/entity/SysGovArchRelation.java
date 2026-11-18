package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 架构关系（G1-N7 公共平台底座—治理中心 WBS T005 总体架构）：
 * 登记架构组件之间的关系（调用/依赖/同步/复制），登记源组件、目标组件、关系类型、
 * 协议与关系状态，支撑六系统边界、部署拓扑与容灾策略的统一治理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_arch_relation")
public class SysGovArchRelation extends BaseEntity {

    /** 关系编号（唯一，支持人工指定）。 */
    private String relationNo;

    /** 源组件（组件编号）。 */
    private String sourceComponent;

    /** 目标组件（组件编号）。 */
    private String targetComponent;

    /** 关系类型：CALL/DEPEND/...，默认 CALL。 */
    private String relationType;

    /** 协议。 */
    private String protocol;

    /** 关系说明。 */
    private String relationDesc;

    /** 关系状态：ACTIVE/INACTIVE 等，默认 ACTIVE。 */
    private String relationStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
