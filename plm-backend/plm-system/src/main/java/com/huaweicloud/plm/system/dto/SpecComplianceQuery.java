package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 环保合规分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecComplianceQuery extends PageQuery {

    /** 合规记录编码。 */
    private String complianceCode;

    /** 物料编码。 */
    private String materialCode;

    /** 合规要求类型。 */
    private String requirementType;

    /** 风险等级。 */
    private String riskLevel;

    /** 状态。 */
    private String status;
}
