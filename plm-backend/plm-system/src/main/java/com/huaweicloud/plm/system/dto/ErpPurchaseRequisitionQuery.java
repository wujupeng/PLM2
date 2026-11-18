package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 请购单分页查询条件（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 * keyword 匹配 requisitionNo/reqOrg。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpPurchaseRequisitionQuery extends PageQuery {

    /** 请购单状态。 */
    private String requisitionStatus;

    /** 请购类型。 */
    private String requisitionType;

    /** 请购人。 */
    private String applicant;
}
