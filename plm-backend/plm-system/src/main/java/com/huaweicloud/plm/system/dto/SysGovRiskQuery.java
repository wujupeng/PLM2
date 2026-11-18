package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 治理风险分页查询条件（G1-N7 治理中心 T001 项目治理）。
 * keyword 匹配 riskNo/riskTitle。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovRiskQuery extends PageQuery {

    /** 所属项目编码。 */
    private String projectCode;

    /** 风险类型。 */
    private String riskType;

    /** 风险状态。 */
    private String riskStatus;

    /** 风险等级。 */
    private String riskLevel;
}
