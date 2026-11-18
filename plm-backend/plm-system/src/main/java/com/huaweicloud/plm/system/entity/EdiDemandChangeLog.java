package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 客户需求变更留痕（N6，DEV-069）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_demand_change_log")
public class EdiDemandChangeLog extends BaseEntity {

    /** 需求主键。 */
    private Long demandId;

    /** 需求编号。 */
    private String demandNo;

    /** 变更类型。 */
    private String changeType;

    /** 变更前数量。 */
    private BigDecimal prevQty;

    /** 变更后数量。 */
    private BigDecimal newQty;

    /** 变更前交期。 */
    private LocalDate prevDate;

    /** 变更后交期。 */
    private LocalDate newDate;

    /** 变更前版本号。 */
    private Integer prevVersion;

    /** 变更后版本号。 */
    private Integer newVersion;

    /** 来源报文编号。 */
    private String messageNo;

    /** 变更原因。 */
    private String changeReason;

    /** 操作人名称。 */
    private String operatorName;

    /** 变更时间。 */
    private LocalDateTime changedAt;

    private String remark;
}
