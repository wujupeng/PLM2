package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 采购协同—订单确认：登记采购订单确认编号、采购订单号、供应商与物料、订单数量与单价金额、
 * 需求日期与确认信息及确认状态，支撑供应商订单确认协同追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_po_confirmation")
public class SrmPoConfirmation extends BaseEntity {

    /** 确认编号（为空时自动生成）。 */
    private String confirmNo;

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

    /** 订单数量。 */
    private BigDecimal poQty;

    /** 单位。 */
    private String unit;

    /** 订单单价。 */
    private BigDecimal unitPrice;

    /** 订单金额。 */
    private BigDecimal totalAmount;

    /** 币种，默认 CNY。 */
    private String currency;

    /** 采购订单日期。 */
    private LocalDate poDate;

    /** 需求日期。 */
    private LocalDate requireDate;

    /** 确认人。 */
    private String confirmBy;

    /** 确认日期。 */
    private LocalDate confirmDate;

    /** 确认状态，默认 PENDING。 */
    private String confirmStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
