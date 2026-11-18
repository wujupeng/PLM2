package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * G1-N5 多币种多税率通用分页查询条件。
 * 各字段按业务对象选择性使用：currencyStatus（币种状态）、fromCurrency/toCurrency/rateType/rateStatus（汇率）、
 * taxType/taxStatus（税率）、priceMode/bizModule/ruleStatus（价格规则）、
 * roundingTarget/roundingMode/ruleStatus（舍入规则）、startDate/endDate（时间区间，作用于创建时间）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class FinanceQuery extends PageQuery {

    /** 币种状态：ACTIVE/DISABLED。 */
    private String currencyStatus;

    /** 源币种。 */
    private String fromCurrency;

    /** 目标币种。 */
    private String toCurrency;

    /** 汇率类型：SPOT/BUY/SELL/AVG。 */
    private String rateType;

    /** 汇率状态：ACTIVE/EXPIRED/DISABLED。 */
    private String rateStatus;

    /** 税率类型：VAT/CIT/OTHER。 */
    private String taxType;

    /** 税率状态：ACTIVE/EXPIRED/DISABLED。 */
    private String taxStatus;

    /** 价格口径：TAX_INCLUSIVE/TAX_EXCLUSIVE。 */
    private String priceMode;

    /** 舍入对象：PRICE/AMOUNT/TAX/QTY。 */
    private String roundingTarget;

    /** 舍入方式：HALF_UP/HALF_EVEN/UP/DOWN。 */
    private String roundingMode;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 起始日期（yyyy-MM-dd）。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd）。 */
    private String endDate;
}
