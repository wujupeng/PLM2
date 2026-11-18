package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 订货传票（OA-DEV-066 销售/进口件、OA-DEV-071 采购）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_order_voucher")
public class OaBizOrderVoucher extends BaseEntity {

    /** 传票号。 */
    private String voucherNo;

    /** 传票类型：SALES/PURCHASE 等。 */
    private String voucherType;

    /** 是否进口件：0/1。 */
    private Integer importFlag;

    private String orderNo;

    private String erpOrderNo;

    private String customerCode;

    private String customerName;

    private String supplierCode;

    private String supplierName;

    private String materialCode;

    private String materialName;

    private BigDecimal qty;

    private String unit;

    private LocalDate deliveryDate;

    private String currency;

    private BigDecimal amount;

    private String tradeTerms;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
