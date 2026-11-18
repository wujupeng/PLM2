package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 治理项目分页查询条件（G1-N7 治理中心 T001 项目治理）。
 * keyword 匹配 projectNo/projectCode/projectName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovProjectQuery extends PageQuery {

    /** 项目类型。 */
    private String projectType;

    /** 项目状态。 */
    private String projectStatus;
}
