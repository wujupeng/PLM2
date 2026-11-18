package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 订货传票保存入参（OA-DEV-066 销售/进口件、OA-DEV-071 采购）。ERP 订单单据仍由 ERP 生成。
 */
@Data
public class BizOrderVoucherSaveRequest {

    /** 传票类型：oa_voucher_type（SALES/PURCHASE）。 */
    private String voucherType;

    /** 是否进口件：1=是，0=否。 */
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

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
