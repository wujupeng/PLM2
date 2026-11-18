package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 存量系统（G1-N7 治理中心 T002 现状盘点）：
 * 登记现有 ERP/PLM/OA/MES/WMS/SRM 等系统的现状（编号、厂商、部署模式、用户数、
 * 迁移策略、运行状态），为替换与迁移提供基线。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_gov_asis_system")
public class SysGovAsisSystem extends BaseEntity {

    /** 系统编号（唯一，支持人工指定）。 */
    private String systemNo;

    /** 系统编码。 */
    private String systemCode;

    /** 系统名称。 */
    private String systemName;

    /** 系统类型：ERP/PLM/OA/MES/WMS/SRM/OTHER，默认 OTHER。 */
    private String systemType;

    /** 厂商。 */
    private String vendor;

    /** 部署模式。 */
    private String deployMode;

    /** 用户数。 */
    private Integer userCount;

    /** 系统状态：ACTIVE/OFFLINE/...，默认 ACTIVE。 */
    private String systemStatus;

    /** 迁移策略。 */
    private String migrateStrategy;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
