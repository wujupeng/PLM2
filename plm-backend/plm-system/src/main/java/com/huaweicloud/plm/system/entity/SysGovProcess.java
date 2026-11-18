package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 端到端流程（G1-N7 治理中心 T003 流程建模）：
 * 按端到端流程（O2C/P2P/P2M/R2S/D2M）建立流程模型，登记编码、层级、负责部门与状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_process")
public class SysGovProcess extends BaseEntity {

    /** 流程编号（唯一，支持人工指定）。 */
    private String processNo;

    /** 流程编码（必填且唯一）。 */
    private String processCode;

    /** 流程名称。 */
    private String processName;

    /** 流程类型：O2C/P2P/P2M/R2S/D2M，默认 O2C。 */
    private String processType;

    /** 流程层级：L1/L2/L3/...，默认 L1。 */
    private String processLevel;

    /** 负责部门。 */
    private String ownerDept;

    /** 流程状态：DRAFT/PUBLISHED/...，默认 DRAFT。 */
    private String processStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述（长文本）。 */
    private String description;

    /** 备注。 */
    private String remark;
}
