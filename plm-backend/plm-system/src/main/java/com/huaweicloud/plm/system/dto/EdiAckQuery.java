package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商回执分页查询条件（N6，DEV-071）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiAckQuery extends PageQuery {

    /** 分发编号。 */
    private String dispatchNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 回执类型。 */
    private String ackType;
}
