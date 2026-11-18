package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商准入分页查询条件（SRM 供应商准入）。
 * keyword 匹配 admissionNo/supplierCode/supplierName/applyBy。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierAdmissionQuery extends PageQuery {

    /** 准入类型。 */
    private String admissionType;

    /** 准入状态。 */
    private String admissionStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
