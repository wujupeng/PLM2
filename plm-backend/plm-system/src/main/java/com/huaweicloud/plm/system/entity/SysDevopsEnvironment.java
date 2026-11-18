package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 环境（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 登记环境编码、类型（开发/测试/验收/生产）、部署目标与是否隔离，
 * 落实环境隔离与多环境部署治理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_devops_environment")
public class SysDevopsEnvironment extends BaseEntity {

    /** 环境编号（唯一，支持人工指定）。 */
    private String envNo;

    /** 环境编码（必填且唯一）。 */
    private String envCode;

    /** 环境名称。 */
    private String envName;

    /** 环境类型：DEV/TEST/UAT/PROD，默认 DEV。 */
    private String envType;

    /** 部署目标。 */
    private String deployTarget;

    /** 是否隔离：1 隔离/0 不隔离，默认 1。 */
    private Integer isolated;

    /** 负责人。 */
    private String ownerName;

    /** 环境状态：ACTIVE/INACTIVE，默认 ACTIVE。 */
    private String envStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
