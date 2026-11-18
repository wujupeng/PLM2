package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 扫码结果（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class MobileScanResult {

    /** 日志编号。 */
    private String logNo;

    /** 条码。 */
    private String barcode;

    /** 扫码结果：SUCCESS/FAIL。 */
    private String scanResult;

    /** 结果信息。 */
    private String message;

    /** 标签校验是否通过。 */
    private Boolean labelValid;
}
