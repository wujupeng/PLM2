package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * WMS 收货上架—收货通知单（ASN）：登记收货通知单号、ASN 类型、供应商与采购/委外单号、
 * 预计到货日期、承运商、收货仓库、通知数量与已收数量及 ASN 状态，支撑到货预约与收货上架追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_asn")
public class WmsAsn extends BaseEntity {

    /** 收货通知单号（为空时自动生成）。 */
    private String asnNo;

    /** ASN 类型，默认 PURCHASE。 */
    private String asnType;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 采购/委外单号。 */
    private String poNo;

    /** 预计到货日期。 */
    private LocalDate expectedArrivalDate;

    /** 承运商。 */
    private String carrier;

    /** 收货仓库编码。 */
    private String warehouseCode;

    /** 通知数量。 */
    private BigDecimal totalQty;

    /** 已收数量。 */
    private BigDecimal receivedQty;

    /** ASN 状态，默认 DRAFT。 */
    private String asnStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
