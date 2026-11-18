package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 生产订单行保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * 订单ID与订单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpProductionOrderLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 行状态，为空默认 OPEN。 */
    private String lineStatus;

    /** 子件物料编码。 */
    @NotBlank(message = "子件物料编码不能为空")
    private String materialCode;

    /** 子件物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 需求数量，为空默认 0。 */
    private BigDecimal requiredQty;

    /** 已领数量，为空默认 0。 */
    private BigDecimal issuedQty;

    /** 已发料数量，为空默认 0。 */
    private BigDecimal pickedQty;

    /** 剩余数量，为空默认 0。 */
    private BigDecimal remainingQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
