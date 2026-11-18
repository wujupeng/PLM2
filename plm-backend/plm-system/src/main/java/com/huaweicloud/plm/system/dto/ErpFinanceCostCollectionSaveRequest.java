package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 成本归集保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceCostCollectionSaveRequest {

    /** 归集单号（为空时自动生成）。 */
    private String collectionNo;

    /** 会计期间编码。 */
    private String periodCode;

    /** 归集对象类型，为空默认 PRODUCT。 */
    private String objectType;

    /** 归集对象编码。 */
    @NotBlank(message = "归集对象编码不能为空")
    private String objectCode;

    /** 归集对象名称。 */
    private String objectName;

    /** 成本要素，为空默认 MATERIAL。 */
    private String costElement;

    /** 归集金额，为空默认 0。 */
    private BigDecimal amount;

    /** 币种，为空默认 CNY。 */
    private String currencyCode;

    /** 归集日期。 */
    private LocalDate collectionDate;

    /** 归集状态，为空默认 DRAFT。 */
    private String collectionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
