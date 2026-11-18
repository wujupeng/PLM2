package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ASN 分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiAsnQuery extends PageQuery {

    /** ASN 编号。 */
    private String asnNo;

    /** 需求编号。 */
    private String demandNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 客户编码。 */
    private String customerCode;

    /** 状态：CREATED/SENT/ACKED/CANCELLED。 */
    private String status;
}
