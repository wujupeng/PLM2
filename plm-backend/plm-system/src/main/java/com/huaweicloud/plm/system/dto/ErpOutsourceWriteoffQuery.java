package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外核销单分页查询条件（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 writeoffNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceWriteoffQuery extends PageQuery {

    /** 核销单状态。 */
    private String writeoffStatus;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;
}
