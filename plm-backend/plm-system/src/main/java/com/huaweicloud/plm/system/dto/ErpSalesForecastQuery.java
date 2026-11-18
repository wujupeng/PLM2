package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 销售预测分页查询条件（G3-N2 ERP 销售管理）。
 * keyword 匹配 forecastNo/materialCode/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSalesForecastQuery extends PageQuery {

    /** 预测状态。 */
    private String forecastStatus;

    /** 预测类型。 */
    private String forecastType;

    /** 客户编码。 */
    private String customerCode;

    /** 物料编码。 */
    private String materialCode;
}
