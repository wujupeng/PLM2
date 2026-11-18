package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 盘点发现（G1-N7 治理中心 T002 现状盘点）：
 * 登记现状盘点中的流程、数据、集成、人工、痛点类发现及其严重程度、处置建议与状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_asis_finding")
public class SysGovAsisFinding extends BaseEntity {

    /** 发现编号（唯一，支持人工指定）。 */
    private String findingNo;

    /** 关联存量系统编码。 */
    private String systemCode;

    /** 发现类型：PAIN_POINT/PROCESS/DATA/INTEGRATION/MANUAL/...，默认 PAIN_POINT。 */
    private String findingType;

    /** 发现标题。 */
    private String findingTitle;

    /** 发现描述。 */
    private String findingDesc;

    /** 严重程度：LOW/MEDIUM/HIGH，默认 MEDIUM。 */
    private String severity;

    /** 处置建议。 */
    private String suggestion;

    /** 发现状态：OPEN/...，默认 OPEN。 */
    private String findingStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
