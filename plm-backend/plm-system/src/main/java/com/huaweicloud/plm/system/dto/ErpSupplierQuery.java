package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商业务档案分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 supplierNo/supplierCode/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpSupplierQuery extends PageQuery {

    /** 供应商类型。 */
    private String supplierType;

    /** 供应商状态。 */
    private String supplierStatus;
}
