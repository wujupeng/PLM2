package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 采购协同—ASN 发货通知：登记发货通知编号、关联送货预约与采购订单、供应商与物料、
 * 发货数量、发货与到货日期、承运商与运单号、包装件数及发货状态，支撑供应商发货协同追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_asn")
public class SrmAsn extends BaseEntity {

    /** 发货通知编号（为空时自动生成）。 */
    private String asnNo;

    /** 送货预约编号。 */
    private String appointmentNo;

    /** 采购订单号。 */
    private String poNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 发货数量。 */
    private BigDecimal shipQty;

    /** 单位。 */
    private String unit;

    /** 发货日期。 */
    private LocalDate shipDate;

    /** 到货日期。 */
    private LocalDate arriveDate;

    /** 承运商。 */
    private String carrier;

    /** 运单号。 */
    private String trackingNo;

    /** 车牌号。 */
    private String vehicleNo;

    /** 包装件数。 */
    private Integer packageCount;

    /** 发货人。 */
    private String asnBy;

    /** 发货时间。 */
    private LocalDate asnDate;

    /** 发货状态，默认 DRAFT。 */
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
