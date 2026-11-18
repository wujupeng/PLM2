package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 环境分页查询条件（G1-N7 WBS T012）。
 * keyword 作用于环境编号/编码/名称（模糊）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DevopsEnvironmentQuery extends PageQuery {

    /** 环境类型：DEV/TEST/UAT/PROD。 */
    private String envType;

    /** 环境状态。 */
    private String envStatus;
}
