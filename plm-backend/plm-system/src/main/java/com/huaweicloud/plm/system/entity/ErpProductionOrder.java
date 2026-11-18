package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 生产管理—生产订单头（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 记录生产订单的生产物料、计划/完工/报废数量、计划与实际开工完工日期，
 * 以及车间、产线、BOM 版本与工艺路线版本、来源与关联需求计划等信息，
 * 明细行见 {@link ErpProductionOrderLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_production_order")
public class ErpProductionOrder extends BaseEntity {

    /** 生产订单号（唯一，支持人工指定，为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，默认 STANDARD。 */
    private String orderType;

    /** 生产物料编码。 */
    private String materialCode;

    /** 生产物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 计划数量，默认 0。 */
    private BigDecimal planQty;

    /** 已完工数量，默认 0。 */
    private BigDecimal completedQty;

    /** 报废数量，默认 0。 */
    private BigDecimal scrapQty;

    /** 订单状态，默认 DRAFT。 */
    private String orderStatus;

    /** 计划开工日期。 */
    private LocalDateTime planStartDate;

    /** 计划完工日期。 */
    private LocalDateTime planEndDate;

    /** 实际开工日期。 */
    private LocalDateTime actualStartDate;

    /** 实际完工日期。 */
    private LocalDateTime actualEndDate;

    /** 车间。 */
    private String workshop;

    /** 产线编码。 */
    private String lineCode;

    /** BOM 版本。 */
    private String bomVersion;

    /** 工艺路线版本。 */
    private String routingVersion;

    /** 来源类型，默认 MANUAL。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 关联需求计划号。 */
    private String planNo;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
