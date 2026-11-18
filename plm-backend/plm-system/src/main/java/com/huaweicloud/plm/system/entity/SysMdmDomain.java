package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据平台—主数据域（G1-N8 公共平台底座 WBS T007 主数据平台）：
 * 登记物料、产品、客户、供应商、组织、人员、仓库、工艺、设备等主数据域
 * 及其权威源系统（六系统不得各自维护主数据，PLM 为物料/产品/BOM 权威源）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_mdm_domain")
public class SysMdmDomain extends BaseEntity {

    /** 主数据域编号（唯一，支持人工指定）。 */
    private String domainNo;

    /** 主数据域编码。 */
    private String domainCode;

    /** 主数据域名称。 */
    private String domainName;

    /** 主数据类型，默认 MATERIAL。 */
    private String masterType;

    /** 权威源系统，默认 PLM。 */
    private String authoritySystem;

    /** 责任部门。 */
    private String ownerDept;

    /** 同步方式，默认 PUSH。 */
    private String syncMode;

    /** 域状态，默认 ACTIVE。 */
    private String domainStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
