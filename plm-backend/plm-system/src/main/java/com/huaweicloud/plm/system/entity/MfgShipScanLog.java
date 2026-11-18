package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 出货扫码日志（N8，DEV-091）：出货前逐件/按箱扫描的校验留痕。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_ship_scan_log")
public class MfgShipScanLog extends BaseEntity {

    /** 日志编号（唯一）。 */
    private String logNo;

    /** 出货单号。 */
    private String shipmentNo;

    /** 扫描码。 */
    private String scanCode;

    /** 扫描类型：PACKAGE/SERIAL/MATERIAL_BATCH。 */
    private String scanType;

    /** 扫描结果：PASS/BLOCKED。 */
    private String scanResult;

    /** 阻断原因。 */
    private String blockReason;

    /** 客户编码。 */
    private String customerCode;

    /** 产品编码。 */
    private String productCode;

    /** 产品版本。 */
    private String productVersion;

    /** 生产批次号。 */
    private String batchNo;

    /** 数量。 */
    private BigDecimal qty;

    /** 操作人。 */
    private String operator;

    /** 扫描时间。 */
    private LocalDateTime scanTime;

    private String remark;
}
