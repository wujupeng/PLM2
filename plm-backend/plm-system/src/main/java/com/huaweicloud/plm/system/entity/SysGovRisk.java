package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 治理中心—项目治理—风险/问题/变更（G1-N7 公共平台底座 WBS T001 项目治理）：
 * 登记所属项目、类型（RISK/ISSUE/CHANGE）、等级（LOW/MEDIUM/HIGH）、
 * 发生概率与影响、缓解措施及状态（OPEN/...），支撑项目风险台账的统一治理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_risk")
public class SysGovRisk extends BaseEntity {

    /** 风险编号（唯一，支持人工指定）。 */
    private String riskNo;

    /** 所属项目编码。 */
    private String projectCode;

    /** 风险标题。 */
    private String riskTitle;

    /** 风险类型，默认 RISK。 */
    private String riskType;

    /** 风险等级，默认 MEDIUM。 */
    private String riskLevel;

    /** 发生概率。 */
    private String probability;

    /** 影响程度。 */
    private String impact;

    /** 缓解措施。 */
    private String mitigation;

    /** 风险状态，默认 OPEN。 */
    private String riskStatus;

    /** 负责人。 */
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
