package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工程变更申请（ECR）分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EcrQuery extends PageQuery {

    /** 变更申请编号。 */
    private String ecrNo;

    /** 状态：draft/submitted/reviewing/approved/rejected/converted/closed。 */
    private String status;

    /** 来源类型：internal/customer/quality/supplier。 */
    private String sourceType;

    /** 风险等级：low/middle/high。 */
    private String riskLevel;

    /** 紧急程度：normal/urgent/emergency。 */
    private String urgency;
}
