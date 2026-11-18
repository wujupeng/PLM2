package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 扫码规则分页查询条件（对应 G3-N7a ERP 条码管理）。
 * keyword 匹配 ruleCode/ruleName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpBarcodeRuleQuery extends PageQuery {

    /** 条码类型。 */
    private String barcodeType;

    /** 扫码业务类型。 */
    private String scanBizType;

    /** 规则状态。 */
    private String ruleStatus;
}
