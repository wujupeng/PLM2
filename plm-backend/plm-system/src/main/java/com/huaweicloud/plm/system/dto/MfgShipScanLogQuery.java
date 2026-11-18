package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 出货扫码日志分页查询条件（N8，DEV-091）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgShipScanLogQuery extends PageQuery {

    /** 出货单号。 */
    private String shipmentNo;

    /** 扫描码。 */
    private String scanCode;

    /** 扫描类型：PACKAGE/SERIAL/MATERIAL_BATCH。 */
    private String scanType;

    /** 扫描结果：PASS/BLOCKED。 */
    private String scanResult;

    /** 客户编码。 */
    private String customerCode;
}
