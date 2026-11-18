package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 线边库存操作请求（发料/消耗/退料/报废/盘点调整，N7，DEV-081）。
 */
@Data
public class WmsLineStockTxnRequest {

    /** 数量；盘点调整场景可正可负。 */
    @NotNull(message = "数量不能为空")
    private BigDecimal qty;

    /** 工单号。 */
    private String workOrderNo;

    /** 关联单据号。 */
    private String refNo;

    /** 容器编码。 */
    private String containerCode;

    /** 目标库位。 */
    private String toLocationCode;

    /** 批次号。 */
    private String batchNo;

    /** 操作人，为空时取当前登录用户。 */
    private String operatorName;

    private String remark;
}
