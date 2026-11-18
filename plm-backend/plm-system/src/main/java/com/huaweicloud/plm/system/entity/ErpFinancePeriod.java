package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * ERP 财务—会计期间（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 维护期间编码、所属年月与起止日期及关账状态，支撑账务期间管控。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_period")
public class ErpFinancePeriod extends BaseEntity {

    /** 期间编码（唯一，由用户指定）。 */
    private String periodCode;

    /** 期间年度。 */
    private Integer periodYear;

    /** 期间月份。 */
    private Integer periodMonth;

    /** 开始日期。 */
    private LocalDate startDate;

    /** 结束日期。 */
    private LocalDate endDate;

    /** 期间状态，默认 OPEN。 */
    private String periodStatus;

    /** 关账时间。 */
    private LocalDateTime closedAt;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
