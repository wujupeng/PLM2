package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工厂（G1-N5 公共平台底座—多组织多工厂 WBS T100）：
 * 承载生产与计划主体，挂在法人主体之下，登记工厂类型、时区与负责人，供各业务系统按工厂维度隔离与汇总。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_factory")
public class SysFactory extends BaseEntity {

    /** 工厂编码（唯一，支持人工指定）。 */
    private String factoryCode;

    /** 工厂名称。 */
    private String factoryName;

    /** 所属法人编码。 */
    private String legalCode;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 工厂类型：MANUFACTURE/ASSEMBLY/WAREHOUSE/OEM。 */
    private String factoryType;

    /** 国家。 */
    private String country;

    /** 地区。 */
    private String region;

    /** 地址。 */
    private String address;

    /** 时区。 */
    private String timezone;

    /** 负责人。 */
    private String manager;

    /** 工厂状态：ACTIVE/DISABLED。 */
    private String factoryStatus;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
