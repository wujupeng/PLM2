package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 代码仓库（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 登记仓库编码、类型（GIT/SVN）、地址、分支策略与所属系统域，
 * 支撑统一仓库治理与分支规范落地。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_devops_repository")
public class SysDevopsRepository extends BaseEntity {

    /** 仓库编号（唯一，支持人工指定）。 */
    private String repoNo;

    /** 仓库编码（必填且唯一）。 */
    private String repoCode;

    /** 仓库名称。 */
    private String repoName;

    /** 仓库类型：GIT/SVN，默认 GIT。 */
    private String repoType;

    /** 仓库地址。 */
    private String repoUrl;

    /** 分支策略：GITFLOW/TRUNK_BASED/GITHUB_FLOW，默认 GITFLOW。 */
    private String branchStrategy;

    /** 所属系统域。 */
    private String systemDomain;

    /** 负责人。 */
    private String ownerName;

    /** 仓库状态：ACTIVE/INACTIVE，默认 ACTIVE。 */
    private String repoStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
