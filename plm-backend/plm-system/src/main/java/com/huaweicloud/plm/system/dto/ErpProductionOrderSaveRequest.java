package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产订单头保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpProductionOrderSaveRequest {

    /** 生产订单号（为空时自动生成）。 */
    private String orderNo;

    /** 订单类型，为空默认 STANDARD。 */
    private String orderType;

    /** 生产物料编码。 */
    @NotBlank(message = "生产物料编码不能为空")
    private String materialCode;

    /** 生产物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 计划数量，为空默认 0。 */
    private BigDecimal planQty;

    /** 已完工数量，为空默认 0。 */
    private BigDecimal completedQty;

    /** 报废数量，为空默认 0。 */
    private BigDecimal scrapQty;

    /** 订单状态，为空默认 DRAFT。 */
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

    /** 来源类型，为空默认 MANUAL。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 关联需求计划号。 */
    private String planNo;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
