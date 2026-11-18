package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—销售预测（G3-N2 ERP 销售管理）：
 * 记录客户对某物料在指定预测周期的需求量与预测类型，
 * 供销售订单与生产计划的滚动预测参考。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_forecast")
public class ErpSalesForecast extends BaseEntity {

    /** 预测单号（唯一，支持人工指定，为空时自动生成）。 */
    private String forecastNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 预测周期，如 2026-11。 */
    private String forecastPeriod;

    /** 预测日期。 */
    private LocalDateTime forecastDate;

    /** 预测数量，默认 0。 */
    private BigDecimal forecastQty;

    /** 预测类型，默认 MONTHLY。 */
    private String forecastType;

    /** 预测状态，默认 OPEN。 */
    private String forecastStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
