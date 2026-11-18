package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据平台—权威源登记（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记每个主数据域在各系统中的权威级别与同步方向，明确「单一事实来源」。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_source")
public class SysMdmSource extends BaseEntity {

    /** 权威源编号（唯一，支持人工指定）。 */
    private String sourceNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 源系统。 */
    private String sourceSystem;

    /** 源实体。 */
    private String sourceEntity;

    /** 权威级别，默认 PRIMARY。 */
    private String authorityLevel;

    /** 同步方向，默认 OUT。 */
    private String syncDirection;

    /** 源状态，默认 ACTIVE。 */
    private String sourceStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
