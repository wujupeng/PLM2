package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 包装规则分页查询条件（N8，DEV-089）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgPackageRuleQuery extends PageQuery {

    /** 规则编号。 */
    private String ruleNo;

    /** 产品编码。 */
    private String productCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 客户编码。 */
    private String customerCode;

    /** 状态：enabled/disabled。 */
    private String status;
}
