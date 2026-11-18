package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 记账凭证分页查询条件（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * keyword 匹配 voucherNo/summary。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceVoucherQuery extends PageQuery {

    /** 凭证状态。 */
    private String voucherStatus;

    /** 业务类型（过滤凭证头的 bizType）。 */
    private String voucherType;

    /** 会计期间编码。 */
    private String periodCode;
}
