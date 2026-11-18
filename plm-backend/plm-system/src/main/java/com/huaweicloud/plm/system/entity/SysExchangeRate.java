package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 汇率（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 按「源币种 + 目标币种 + 汇率类型 + 生效区间」登记，同一币种对可存在多个生效区间与多种汇率类型，
 * 业务取价按生效日期匹配，避免历史汇率被覆盖。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_exchange_rate")
public class SysExchangeRate extends BaseEntity {

    /** 汇率编号（唯一，支持人工指定）。 */
    private String rateNo;

    /** 源币种。 */
    private String fromCurrency;

    /** 目标币种。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
