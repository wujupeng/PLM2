package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 税率保存请求（G1-N5 公共平台底座—多币种多税率 WBS T101）。
 */
@Data
public class SysTaxRateSaveRequest {

    /** 税率编号（为空时自动生成）。 */
    private String taxNo;

    /** 税率编码。 */
    private String taxCode;

    /** 税率名称。 */
    @NotBlank(message = "税率名称不能为空")
    private String taxName;

    /** 税率类型：VAT/CIT/OTHER。 */
    private String taxType;

    /** 税率（百分数值）。 */
    private BigDecimal taxRate;

    /** 适用国家。 */
    private String country;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 税率状态：ACTIVE/EXPIRED/DISABLED。 */
    private String taxStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
