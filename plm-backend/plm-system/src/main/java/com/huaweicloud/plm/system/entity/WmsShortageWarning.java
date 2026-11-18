package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 缺料预警（N7，DEV-082）：需求 + 库存 + 在途 + 采购交期 + 计划 + 安全库存的计算结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_shortage_warning")
public class WmsShortageWarning extends BaseEntity {

    /** 预警编号（唯一）。 */
    private String warningNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 产线。 */
    private String lineCode;

    /** 工单号。 */
    private String workOrderNo;

    /** 需求量。 */
    private BigDecimal requiredQty;

    /** 现有库存量。 */
    private BigDecimal onHandQty;

    /** 在途量。 */
    private BigDecimal inTransitQty;

    /** 安全库存。 */
    private BigDecimal safetyStock;

    /** 缺口量。 */
    private BigDecimal gapQty;

    /** 需求日期。 */
    private LocalDate requiredDate;

    /** 采购提前期（天）。 */
    private Integer purchaseLeadTimeDays;

    /** 预警等级：L1/L2/L3/CRITICAL。 */
    private String warningLevel;

    /** 计算依据说明。 */
    private String calcBasis;

    /** 预警状态：OPEN/ACK/PROCESSING/CLOSED。 */
    private String warningStatus;

    /** 计算时间。 */
    private LocalDateTime calcAt;

    /** 来源：CALC/MANUAL/ERP。 */
    private String source;

    private String remark;
}
