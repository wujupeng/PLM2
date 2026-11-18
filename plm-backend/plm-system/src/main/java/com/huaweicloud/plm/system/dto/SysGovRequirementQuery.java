package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 需求分页查询条件（G1-N7 WBS T004 需求追踪）。
 * keyword 匹配需求编号/需求编码/需求名称。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovRequirementQuery extends PageQuery {

    /** 需求类型：BUSINESS/FUNCTION/DATA/API/NONFUNCTION 等。 */
    private String reqType;

    /** 需求状态。 */
    private String reqStatus;

    /** 需求优先级：P0/P1/P2/P3。 */
    private String reqPriority;

    /** 业务模块。 */
    private String bizModule;
}
