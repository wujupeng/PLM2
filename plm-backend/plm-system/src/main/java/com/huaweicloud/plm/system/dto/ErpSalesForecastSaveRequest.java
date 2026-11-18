package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售预测保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpSalesForecastSaveRequest {

    /** 预测单号（为空时自动生成）。 */
    private String forecastNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 预测周期，如 2026-11。 */
    private String forecastPeriod;

    /** 预测日期。 */
    private LocalDateTime forecastDate;

    /** 预测数量，为空默认 0。 */
    private BigDecimal forecastQty;

    /** 预测类型，为空默认 MONTHLY。 */
    private String forecastType;

    /** 预测状态，为空默认 OPEN。 */
    private String forecastStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
