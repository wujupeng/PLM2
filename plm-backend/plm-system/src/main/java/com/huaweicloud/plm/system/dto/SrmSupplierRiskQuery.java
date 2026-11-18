package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商风险分页查询条件（对应 SRM 供应商风险管理）。
 * keyword 匹配 riskNo/supplierCode/supplierName/riskSource。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierRiskQuery extends PageQuery {

    /** 风险类型。 */
    private String riskType;

    /** 风险等级。 */
    private String riskLevel;

    /** 风险状态。 */
    private String riskStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
