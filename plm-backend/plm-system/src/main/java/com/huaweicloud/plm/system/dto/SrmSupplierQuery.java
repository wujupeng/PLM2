package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商主档分页查询条件（对应 G4-N1 SRM 供应商全生命周期）。
 * keyword 匹配 supplierCode/supplierName/shortName/contact。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierQuery extends PageQuery {

    /** 供应商类型。 */
    private String supplierType;

    /** 供应商状态。 */
    private String supplierStatus;

    /** 等级。 */
    private String gradeLevel;
}
