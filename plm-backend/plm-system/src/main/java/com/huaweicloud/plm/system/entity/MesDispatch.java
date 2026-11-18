package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 派工任务：登记派工单号、生产工单号、工序信息、设备与产线、物料信息、计划/派工/进度数量、
 * 进度率、派工状态、操作工、派工与反馈时间及组织信息，支撑 MES 派工任务下达与进度反馈。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_dispatch")
public class MesDispatch extends BaseEntity {

    /** 派工单号。 */
    private String dispatchNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String processCode;

    /** 工序名称。 */
    private String processName;

    /** 设备编码。 */
    private String equipmentCode;

    /** 产线编码。 */
    private String lineCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 派工数量。 */
    private BigDecimal dispatchedQty;

    /** 进度数量。 */
    private BigDecimal progressQty;

    /** 进度率。 */
    private BigDecimal progressRate;

    /** 派工状态，默认 DRAFT。 */
    private String dispatchStatus;

    /** 操作工。 */
    private String operator;

    /** 派工时间。 */
    private LocalDateTime dispatchTime;

    /** 反馈时间。 */
    private LocalDateTime feedbackTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
