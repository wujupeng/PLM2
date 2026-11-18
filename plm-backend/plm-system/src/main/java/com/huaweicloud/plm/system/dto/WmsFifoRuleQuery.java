package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * FIFO 规则分页查询条件（N7，DEV-079）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsFifoRuleQuery extends PageQuery {

    /** 适用范围：GLOBAL/MATERIAL/CUSTOMER。 */
    private String scope;

    /** 物料编码（物料策略）。 */
    private String materialCode;

    /** 客户编码（客户特定策略）。 */
    private String customerCode;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;
}
