package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 代码仓库分页查询条件（G1-N7 WBS T012）。
 * keyword 作用于仓库编号/编码/名称/地址（模糊）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DevopsRepositoryQuery extends PageQuery {

    /** 仓库类型：GIT/SVN。 */
    private String repoType;

    /** 分支策略。 */
    private String branchStrategy;

    /** 所属系统域。 */
    private String systemDomain;

    /** 仓库状态。 */
    private String repoStatus;
}
