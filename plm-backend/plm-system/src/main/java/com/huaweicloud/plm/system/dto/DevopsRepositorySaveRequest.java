package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 代码仓库保存请求（G1-N7 WBS T012）。
 */
@Data
public class DevopsRepositorySaveRequest {

    /** 仓库编号（为空时自动生成）。 */
    private String repoNo;

    /** 仓库编码（必填且唯一）。 */
    @NotBlank(message = "仓库编码不能为空")
    private String repoCode;

    /** 仓库名称。 */
    @NotBlank(message = "仓库名称不能为空")
    private String repoName;

    /** 仓库类型：GIT/SVN，为空默认 GIT。 */
    private String repoType;

    /** 仓库地址。 */
    private String repoUrl;

    /** 分支策略，为空默认 GITFLOW。 */
    private String branchStrategy;

    /** 所属系统域。 */
    private String systemDomain;

    /** 负责人。 */
    private String ownerName;

    /** 仓库状态，为空默认 ACTIVE。 */
    private String repoStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
