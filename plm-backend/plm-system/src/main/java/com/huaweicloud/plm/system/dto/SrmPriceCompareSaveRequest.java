package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 报价比价保存请求（对应报价比价）。
 */
@Data
public class SrmPriceCompareSaveRequest {

    /** 比价单号（为空时自动生成）。 */
    private String compareNo;

    /** 询价单号。 */
    @NotBlank(message = "询价单号不能为空")
    private String rfqNo;

    /** 比价标题。 */
    private String compareTitle;

    /** 参与供应商数。 */
    private Integer supplierCount;

    /** 最低报价。 */
    private BigDecimal lowestPrice;

    /** 最高报价。 */
    private BigDecimal highestPrice;

    /** 平均报价。 */
    private BigDecimal avgPrice;

    /** 推荐供应商编码。 */
    private String recommendSupplierCode;

    /** 推荐供应商名称。 */
    private String recommendSupplierName;

    /** 比价规则，为空默认 LOWEST_PRICE。 */
    private String compareRule;

    /** 比价结论。 */
    private String compareConclusion;

    /** 比价人。 */
    private String compareBy;

    /** 比价日期。 */
    private LocalDate compareDate;

    /** 比价状态，为空默认 DRAFT。 */
    private String compareStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
