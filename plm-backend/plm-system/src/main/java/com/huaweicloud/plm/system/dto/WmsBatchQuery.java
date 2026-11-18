package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料批次分页查询条件（N7，DEV-075）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsBatchQuery extends PageQuery {

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 所在库位。 */
    private String locationCode;

    /** 批次状态：IN_STOCK/CONSUMED/RETURNED/SCRAPPED/EXPIRED。 */
    private String batchStatus;

    /** 检验状态：PENDING/RELEASED/REJECTED。 */
    private String inspectionStatus;

    /** 容器编码/箱码。 */
    private String containerCode;

    /** 供应商编码。 */
    private String supplierCode;
}
