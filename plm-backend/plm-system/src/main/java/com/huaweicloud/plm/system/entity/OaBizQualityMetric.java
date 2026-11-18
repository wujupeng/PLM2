package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 质量报表与指标（OA-DEV-069，权威台账在 QMS）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_quality_metric")
public class OaBizQualityMetric extends BaseEntity {

    /** 指标单号。 */
    private String metricNo;

    /** 指标类型：TARGET/ACTUAL 等。 */
    private String metricType;

    private String metricCode;

    private String metricName;

    private String metricPeriod;

    private Long deptId;

    private String deptName;

    private BigDecimal targetValue;

    private BigDecimal actualValue;

    private String unit;

    private BigDecimal achieveRate;

    private String calcFormula;

    /** 数据来源：MANUAL/QMS 等。 */
    private String dataSource;

    private String sourceRef;

    private LocalDateTime refreshTime;

    private Long ownerUserId;

    private String ownerName;

    private Long orgId;

    private String orgName;

    /** 指标状态：DRAFT/PUBLISHED 等。 */
    private String metricStatus;

    private String remark;
}
