package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * WMS 收货上架—上架任务：登记上架任务号、收货单号与物料信息、批次与上架数量、
 * 源库位与目标库位、作业策略与作业人、上架时间、优先级及上架状态，支撑上架作业调度与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_putaway_task")
public class WmsPutawayTask extends BaseEntity {

    /** 上架任务号（为空时自动生成）。 */
    private String taskNo;

    /** 收货单号。 */
    private String receiptNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 上架数量。 */
    private BigDecimal qty;

    /** 源库位（通常为待检区）。 */
    private String fromBinCode;

    /** 目标库位。 */
    private String toBinCode;

    /** 作业策略编码。 */
    private String strategyCode;

    /** 作业人。 */
    private String operator;

    /** 上架时间。 */
    private LocalDateTime putawayTime;

    /** 优先级，默认 0。 */
    private Integer taskPriority;

    /** 上架状态，默认 PENDING。 */
    private String putawayStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
