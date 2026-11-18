package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 应付单分页查询条件（对应 WBS T028 ERP 财务，属 G3 ERP）。
 * keyword 匹配 apNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinancePayableQuery extends PageQuery {

    /** 应付状态。 */
    private String apStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
