package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 工艺资源—工序计划（对应 G3-N7b ERP 工艺资源）：
 * 按生产订单排定工序与资源，登记计划单号、生产订单、物料、工艺路线、
 * 工序、资源、计划数量与计划起止时间、计划状态，支撑工序排产与资源占用追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_process_plan")
public class ErpProcessPlan extends BaseEntity {

    /** 计划单号（唯一，为空时自动生成）。 */
    private String planNo;

    /** 生产订单号。 */
    private String productionOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 工艺路线编码。 */
    private String routeCode;

    /** 工序号。 */
    private Integer operationNo;

    /** 工序名称。 */
    private String operationName;

    /** 资源编码。 */
    private String resourceCode;

    /** 计划数量，默认 0。 */
    private BigDecimal planQty;

    /** 计划开始时间。 */
    private LocalDateTime plannedStartTime;

    /** 计划结束时间。 */
    private LocalDateTime plannedEndTime;

    /** 计划状态，默认 PENDING。 */
    private String planStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
