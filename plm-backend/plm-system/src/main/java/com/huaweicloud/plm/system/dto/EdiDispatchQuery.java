package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 需求分页查询条件（N6，DEV-070）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class EdiDispatchQuery extends PageQuery {

    /** 需求编号。 */
    private String demandNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 发送状态：PENDING/SENT/FAILED/ACKED。 */
    private String sendStatus;

    /** 分发编号。 */
    private String dispatchNo;
}
