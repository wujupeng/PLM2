package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商分级分页查询条件（对应 SRM 供应商管理—供应商分级）。
 * keyword 匹配 gradeNo/supplierCode/supplierName/evaluator。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierGradeQuery extends PageQuery {

    /** 分级等级。 */
    private String gradeLevel;

    /** 分级状态。 */
    private String gradeStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
