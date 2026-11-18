package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 扫码领料校验记录（N7，DEV-078/080）：落库 FIFO 与防混料校验结果及授权留痕。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_pick_record")
public class WmsPickRecord extends BaseEntity {

    /** 领料单号（唯一）。 */
    private String pickNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 库位。 */
    private String locationCode;

    /** 容器编码。 */
    private String containerCode;

    /** 领用数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 操作人。 */
    private String operatorName;

    /** 校验结果：PASS/BLOCKED/WARN。 */
    private String scanResult;

    /** FIFO 校验结果：FIFO_OK/FIFO_VIOLATION/FIFO_EXCEPTION。 */
    private String fifoResult;

    /** 命中的 FIFO 规则编码。 */
    private String fifoRuleCode;

    /** 按 FIFO 应领用的批次。 */
    private String expectedBatchNo;

    /** 防混料校验结果：MIX_OK/MIX_VIOLATION。 */
    private String mixCheckResult;

    /** 命中的防混料绑定编号。 */
    private String bindingNo;

    /** 阻断原因。 */
    private String blockReason;

    /** 是否已授权例外：0/1。 */
    private Integer exceptionAuthorized;

    /** 授权人。 */
    private String authorizedBy;

    /** 授权原因。 */
    private String authorizeReason;

    /** 关联配送任务号。 */
    private String relatedDeliveryNo;

    /** 领料时间。 */
    private LocalDateTime pickAt;

    private String remark;
}
