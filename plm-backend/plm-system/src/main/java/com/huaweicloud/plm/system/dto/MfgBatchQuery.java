package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 生产批次分页查询条件（N8，DEV-085）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgBatchQuery extends PageQuery {

    /** 生产批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 产品编码。 */
    private String productCode;

    /** 产线。 */
    private String lineCode;

    /** 批次状态：PLANNED/IN_PROCESS/COMPLETED/CLOSED。 */
    private String batchStatus;

    /** 放行状态：UNRELEASED/RELEASED/HOLD。 */
    private String releaseStatus;

    /** 生产日期起。 */
    private LocalDate productionDateFrom;

    /** 生产日期止。 */
    private LocalDate productionDateTo;
}
