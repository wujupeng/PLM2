package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 扫描校验保存请求（对应 G3-N7a ERP 条码管理）。
 */
@Data
public class ErpBarcodeScanSaveRequest {

    /** 扫描单号（为空时自动生成）。 */
    private String scanNo;

    /** 条码编号。 */
    private String barcodeNo;

    /** 扫描类型，为空默认 RECEIPT。 */
    private String scanType;

    /** 业务单据号。 */
    private String bizNo;

    /** 物料编码。 */
    private String materialCode;

    /** 扫描数量，为空默认 0。 */
    private BigDecimal scanQty;

    /** 扫描时间。 */
    private LocalDateTime scanTime;

    /** 扫描人。 */
    private String scanner;

    /** 扫描结果，为空默认 PASS。 */
    private String scanResult;

    /** 失败原因。 */
    private String failReason;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
