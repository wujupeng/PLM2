package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 订单确认分页查询条件（对应订单确认）。
 * keyword 匹配 confirmNo/poNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPoConfirmationQuery extends PageQuery {

    /** 确认状态。 */
    private String confirmStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购订单号。 */
    private String poNo;
}
