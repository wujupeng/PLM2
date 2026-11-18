package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 来料质量分页查询条件（对应来料质量）。
 * keyword 匹配 iqcNo/poNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmIncomingQualityQuery extends PageQuery {

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态。 */
    private String iqcStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 采购订单号。 */
    private String poNo;
}
