package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存流水（N7，DEV-081）：发料/消耗/退料/报废/盘点差异/调拨留痕。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_inventory_txn")
public class WmsInventoryTxn extends BaseEntity {

    /** 流水号（唯一）。 */
    private String txnNo;

    /** 流水类型：INBOUND/ISSUE/CONSUME/RETURN/SCRAP/COUNT_ADJUST/TRANSFER。 */
    private String txnType;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 来源库位。 */
    private String fromLocationCode;

    /** 目标库位。 */
    private String toLocationCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 工单号。 */
    private String workOrderNo;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 关联单据号。 */
    private String refNo;

    /** 操作人。 */
    private String operatorName;

    /** 发生时间。 */
    private LocalDateTime txnAt;

    private String remark;
}
