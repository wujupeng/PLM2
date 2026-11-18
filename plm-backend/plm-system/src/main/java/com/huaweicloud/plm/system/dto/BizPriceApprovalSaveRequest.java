package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 价格审批保存入参（OA-DEV-063 销售价格 / OA-DEV-071 零件价格）。
 */
@Data
public class BizPriceApprovalSaveRequest {

    /** 价格类别：oa_price_category（SALES/PART）。 */
    private String priceCategory;

    /** 变更类型：oa_price_change_type（NEW/CHANGE）。 */
    private String changeType;

    private String materialCode;

    private String materialName;

    private String customerCode;

    private String customerName;

    private String supplierCode;

    private String supplierName;

    private BigDecimal priceAmount;

    private BigDecimal oldPrice;

    private String currency;

    private String priceUnit;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private String costBasis;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
