package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工序过站与采集记录（N8，DEV-086）：来自 MES 的工序、设备、工位、人员、时间与结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_operation_record")
public class MfgOperationRecord extends BaseEntity {

    /** 记录编号（唯一）。 */
    private String recordNo;

    /** 生产批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 产品编码。 */
    private String productCode;

    /** 序列号（单件级）。 */
    private String serialNo;

    /** 工序编码。 */
    private String operationCode;

    /** 工序名称。 */
    private String operationName;

    /** 工序顺序。 */
    private Integer seqNo;

    /** 工位。 */
    private String workStation;

    /** 产线。 */
    private String lineCode;

    /** 设备编码。 */
    private String equipmentCode;

    /** 操作人员。 */
    private String operator;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 投入数量。 */
    private BigDecimal inQty;

    /** 产出数量。 */
    private BigDecimal outQty;

    /** 报废数量。 */
    private BigDecimal scrapQty;

    /** 结果：OK/NG/REWORK。 */
    private String result;

    /** 来源系统。 */
    private String sourceSystem;

    /** 采集时间。 */
    private LocalDateTime collectTime;

    /** 接口状态：RECEIVED/PROCESSED/FAILED/COMPENSATED。 */
    private String interfaceStatus;

    private String remark;
}
