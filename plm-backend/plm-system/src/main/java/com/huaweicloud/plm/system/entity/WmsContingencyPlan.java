package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 应急预案（N7，DEV-084）：替代料/跨仓调拨/供应商加急/计划调整/升级。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_contingency_plan")
public class WmsContingencyPlan extends BaseEntity {

    /** 预案编号（唯一）。 */
    private String planNo;

    /** 关联欠料单号。 */
    private String caseNo;

    /** 关联缺料预警编号。 */
    private String warningNo;

    /** 物料编码。 */
    private String materialCode;

    /** 预案类型：SUBSTITUTE/TRANSFER/EXPEDITE/RESCHEDULE/ESCALATE。 */
    private String planType;

    /** 替代料编码。 */
    private String substituteMaterial;

    /** 目标库位（跨仓调拨）。 */
    private String targetLocationCode;

    /** 供应商编码（加急）。 */
    private String supplierCode;

    /** 预计数量。 */
    private BigDecimal expectedQty;

    /** 预计日期。 */
    private LocalDate expectedDate;

    /** 成本影响。 */
    private String costImpact;

    /** 状态：DRAFT/APPROVED/EXECUTING/COMPLETED/CANCELLED。 */
    private String planStatus;

    /** 审批人。 */
    private String approver;

    /** 审批时间。 */
    private LocalDateTime approvedAt;

    /** 执行时间。 */
    private LocalDateTime executedAt;

    private String remark;
}
