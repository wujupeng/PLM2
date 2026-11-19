package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标签追溯对账分页查询条件。
 * keyword 匹配 reconcileNo/reconcileName/resultMessage。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgLabelTraceReconcileQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 对账状态。 */
    private String reconcileStatus;

    /** 接口编号。 */
    private String interfaceNo;
}
