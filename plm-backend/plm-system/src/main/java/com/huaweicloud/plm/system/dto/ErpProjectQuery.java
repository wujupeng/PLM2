package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 项目档案分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 projectNo/projectCode/projectName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProjectQuery extends PageQuery {

    /** 项目类型。 */
    private String projectType;

    /** 项目状态。 */
    private String projectStatus;
}
