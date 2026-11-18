package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 物料配送任务（N7，DEV-077）：派发/接单/配送/签收。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_delivery_task")
public class WmsDeliveryTask extends BaseEntity {

    /** 任务编号（唯一）。 */
    private String taskNo;

    /** 关联看板编号。 */
    private String kanbanNo;

    /** 任务类型：REPLENISH/RETURN/TRANSFER。 */
    private String taskType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 来源库位。 */
    private String fromLocationCode;

    /** 目标库位。 */
    private String toLocationCode;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 批次号（配送指定批次时）。 */
    private String batchNo;

    /** 优先级（1 最高）。 */
    private Integer priority;

    /** 任务状态：CREATED/ACCEPTED/DELIVERING/SIGNED/CANCELLED。 */
    private String taskStatus;

    /** 配送人。 */
    private String assignee;

    /** 派发时间。 */
    private LocalDateTime dispatchAt;

    /** 接单时间。 */
    private LocalDateTime acceptAt;

    /** 配送时间。 */
    private LocalDateTime deliverAt;

    /** 签收时间。 */
    private LocalDateTime signAt;

    /** 签收人。 */
    private String signBy;

    private String remark;
}
