package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 需求（G1-N7 公共平台底座—治理中心 WBS T004 需求追踪）：
 * 建立「业务需求-功能-数据/API-测试用例-验收证据」追踪矩阵的以需求为主键的台账，
 * 登记需求类型、来源、业务模块、优先级、状态与验收标准，作为需求到交付双向追溯的锚点。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_requirement")
public class SysGovRequirement extends BaseEntity {

    /** 需求编号（唯一，支持人工指定）。 */
    private String reqNo;

    /** 需求编码。 */
    private String reqCode;

    /** 需求名称。 */
    private String reqName;

    /** 需求类型：BUSINESS/FUNCTION/DATA/API/NONFUNCTION 等，默认 BUSINESS。 */
    private String reqType;

    /** 需求来源。 */
    private String source;

    /** 业务模块。 */
    private String bizModule;

    /** 需求优先级：P0/P1/P2/P3，默认 P1。 */
    private String reqPriority;

    /** 需求状态：PROPOSED/...，默认 PROPOSED。 */
    private String reqStatus;

    /** 验收标准。 */
    private String acceptanceCriteria;

    /** 责任人。 */
    private String ownerName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
