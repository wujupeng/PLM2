package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 条码管理—扫描校验（对应 G3-N7a ERP 条码管理）：
 * 登记扫描单号、条码、业务单据、物料与扫描数量、结果，支撑扫码校验追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_barcode_scan")
public class ErpBarcodeScan extends BaseEntity {

    /** 扫描单号（唯一，为空时自动生成）。 */
    private String scanNo;

    /** 条码编号。 */
    private String barcodeNo;

    /** 扫描类型，默认 RECEIPT。 */
    private String scanType;

    /** 业务单据号。 */
    private String bizNo;

    /** 物料编码。 */
    private String materialCode;

    /** 扫描数量，默认 0。 */
    private BigDecimal scanQty;

    /** 扫描时间。 */
    private LocalDateTime scanTime;

    /** 扫描人。 */
    private String scanner;

    /** 扫描结果，默认 PASS。 */
    private String scanResult;

    /** 失败原因。 */
    private String failReason;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
