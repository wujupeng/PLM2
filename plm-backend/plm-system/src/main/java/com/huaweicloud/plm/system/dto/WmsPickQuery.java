package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 扫码领料记录分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsPickQuery extends PageQuery {

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 产线。 */
    private String lineCode;

    /** 校验结果：PASS/BLOCKED/WARN。 */
    private String scanResult;

    /** FIFO 校验结果。 */
    private String fifoResult;

    /** 防混料校验结果。 */
    private String mixCheckResult;

    /** 操作人。 */
    private String operatorName;
}
