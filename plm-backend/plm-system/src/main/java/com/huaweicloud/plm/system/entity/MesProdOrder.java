package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产工单：接收 ERP 工单并登记工单号、物料信息、计划数量与产出数量、工单状态、
 * 优先级、车间编码、计划起止时间及组织信息，支撑 MES 生产工单的接收与排产追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_prod_order")
public class MesProdOrder extends BaseEntity {

    /** 工单号。 */
    private String orderNo;

    /** ERP工单号。 */
    private String erpOrderNo;

    /** 工单来源，默认 ERP。 */
    private String orderSource;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已生产数量。 */
    private BigDecimal productQty;

    /** 工单状态，默认 DRAFT。 */
    private String orderStatus;

    /** 优先级，默认 NORMAL。 */
    private String priority;

    /** 车间编码。 */
    private String workshopCode;

    /** 计划开始时间。 */
    private LocalDateTime planStartTime;

    /** 计划结束时间。 */
    private LocalDateTime planEndTime;

    /** 接收时间。 */
    private LocalDateTime receiveTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
