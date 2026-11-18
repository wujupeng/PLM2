package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 变更确认分页查询条件（对应变更确认）。
 * keyword 匹配 changeNo/poNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPoChangeQuery extends PageQuery {

    /** 变更类型。 */
    private String changeType;

    /** 变更状态。 */
    private String changeStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购订单号。 */
    private String poNo;
}
