package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商资质分页查询条件（SRM 供应商资质）。
 * keyword 匹配 qualificationNo/supplierCode/supplierName/certNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierQualificationQuery extends PageQuery {

    /** 资质类型。 */
    private String qualificationType;

    /** 资质状态。 */
    private String qualificationStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
