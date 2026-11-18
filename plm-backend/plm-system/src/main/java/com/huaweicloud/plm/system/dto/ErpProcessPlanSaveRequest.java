package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工序计划保存请求（对应 G3-N7b ERP 工艺资源）。
 */
@Data
public class ErpProcessPlanSaveRequest {

    /** 计划单号（为空时自动生成）。 */
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

    /** 计划数量，为空默认 0。 */
    private BigDecimal planQty;

    /** 计划开始时间。 */
    private LocalDateTime plannedStartTime;

    /** 计划结束时间。 */
    private LocalDateTime plannedEndTime;

    /** 计划状态，为空默认 PENDING。 */
    private String planStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
