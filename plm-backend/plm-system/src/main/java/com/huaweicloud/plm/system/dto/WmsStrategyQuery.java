package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 作业策略分页查询条件（对应作业策略）。
 * keyword 匹配 strategyCode/strategyName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsStrategyQuery extends PageQuery {

    /** 策略类型。 */
    private String strategyType;

    /** 策略状态。 */
    private String strategyStatus;
}
