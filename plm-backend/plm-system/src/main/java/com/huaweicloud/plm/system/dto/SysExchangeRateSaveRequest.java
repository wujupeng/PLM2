package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 汇率保存请求（G1-N5 公共平台底座—多币种多税率 WBS T101）。
 */
@Data
public class SysExchangeRateSaveRequest {

    /** 汇率编号（为空时自动生成）。 */
    private String rateNo;

    /** 源币种。 */
    @NotBlank(message = "源币种不能为空")
    private String fromCurrency;

    /** 目标币种。 */
    @NotBlank(message = "目标币种不能为空")
    private String toCurrency;

    /** 汇率类型：SPOT/BUY/SELL/AVG。 */
    private String rateType;

    /** 汇率值。 */
    private BigDecimal rateValue;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 汇率来源。 */
    private String rateSource;

    /** 汇率状态：ACTIVE/EXPIRED/DISABLED。 */
    private String rateStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
