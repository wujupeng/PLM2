package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 需求计划行保存请求（对应 WBS T025 需求计划、T095 LRP/MRP需求计划，属 G3 ERP）。
 * 计划ID与计划号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpDemandPlanLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 行状态，为空默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 需求数量，为空默认 0。 */
    private BigDecimal demandQty;

    /** 需求来源类型，为空默认 SALES。 */
    private String sourceType;

    /** 来源单号。 */
    private String sourceNo;

    /** 客户编码。 */
    private String customerCode;

    /** 需求日期。 */
    private LocalDateTime demandDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
