package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购询价单（对应 WBS T023 采购管理，属 G3 ERP）：
 * 记录针对某物料的询价数量、询价日期、报价截止、供应商与报价结果，
 * 作为采购订单比价与供应商选择的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_inquiry")
public class ErpPurchaseInquiry extends BaseEntity {

    /** 询价单号（唯一，支持人工指定，为空时自动生成）。 */
    private String inquiryNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 询价数量，默认 0。 */
    private BigDecimal inquiryQty;

    /** 询价日期。 */
    private LocalDateTime inquiryDate;

    /** 报价截止时间。 */
    private LocalDateTime quoteDeadline;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 报价单价，默认 0。 */
    private BigDecimal quotePrice;

    /** 币别，默认 CNY。 */
    private String currencyCode;

    /** 报价日期。 */
    private LocalDateTime quoteDate;

    /** 报价有效期。 */
    private LocalDateTime validUntil;

    /** 询价单状态，默认 DRAFT。 */
    private String inquiryStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
