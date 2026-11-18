package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购结算（G3-N3a ERP 采购管理）：
 * 记录供应商采购结算对应的订单、发票、结算金额、已付金额、余额与账期等信息，
 * 供采购、财务进行应付结算与账龄管理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_settlement")
public class ErpPurchaseSettlement extends BaseEntity {

    /** 结算单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String settlementNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 关联采购订单编号。 */
    private String orderNo;

    /** 关联采购发票编号。 */
    private String invoiceNo;

    /** 结算日期。 */
    private LocalDateTime settlementDate;

    /** 结算金额，默认 0。 */
    private BigDecimal settlementAmount;

    /** 已付金额，默认 0。 */
    private BigDecimal paidAmount;

    /** 结算余额，默认 0。 */
    private BigDecimal settleBalance;

    /** 账期，默认 NET30。 */
    private String paymentTerm;

    /** 结算状态，默认 OPEN。 */
    private String settlementStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
