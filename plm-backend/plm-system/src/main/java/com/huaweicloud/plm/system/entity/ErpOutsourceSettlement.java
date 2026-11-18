package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外结算单（对应 WBS T024 委外管理，属 G3 ERP）：
 * 记录委外加工的结算金额、已付金额与结算余额、账期与结算状态，
 * 作为委外加工费用对账与付款的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_settlement")
public class ErpOutsourceSettlement extends BaseEntity {

    /** 结算单号（唯一，支持人工指定，为空时自动生成）。 */
    private String settlementNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 委外订单号。 */
    private String orderNo;

    /** 发票号。 */
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

    /** 结算单状态，默认 OPEN。 */
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
