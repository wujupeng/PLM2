package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 架构组件分页查询条件（G1-N7 WBS T005 总体架构）。
 * keyword 匹配组件编号/组件编码/组件名称。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovArchComponentQuery extends PageQuery {

    /** 架构分层：APPLICATION/DATA/TECHNOLOGY/SECURITY 等。 */
    private String archLayer;

    /** 系统域。 */
    private String systemDomain;

    /** 组件状态。 */
    private String componentStatus;
}
