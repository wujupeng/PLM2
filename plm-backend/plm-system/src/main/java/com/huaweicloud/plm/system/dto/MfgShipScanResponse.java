package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.MfgShipScanLog;
import lombok.Data;

/**
 * 出货扫码结果响应（N8，DEV-091）。
 */
@Data
public class MfgShipScanResponse {

    /** 扫描结果：PASS/BLOCKED。 */
    private String scanResult;

    /** 阻断原因。 */
    private String blockReason;

    /** 扫描后已扫数量。 */
    private java.math.BigDecimal scannedQty;

    /** 计划数量。 */
    private java.math.BigDecimal plannedQty;

    /** 扫码留痕。 */
    private MfgShipScanLog log;
}
