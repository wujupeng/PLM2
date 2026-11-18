package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import lombok.Data;

/**
 * 质量报表与指标保存入参（OA-DEV-069）。质量台账权威在 QMS，OA 承载口径配置与展示。
 */
@Data
public class BizQualityMetricSaveRequest {

    /** 指标类型：oa_quality_metric_type（TARGET/RTY/MONTHLY_REPORT）。 */
    private String metricType;

    private String metricCode;

    private String metricName;

    private String metricPeriod;

    private Long deptId;

    private String deptName;

    private BigDecimal targetValue;

    private BigDecimal actualValue;

    private String unit;

    private String calcFormula;

    /** 数据来源：oa_data_source，默认可配置为 QMS。 */
    private String dataSource;

    private String sourceRef;

    private Long ownerUserId;

    private String ownerName;

    private String remark;
}
