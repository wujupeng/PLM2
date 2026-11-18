package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 请购单行保存请求（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 * 请购单ID与请购单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpPurchaseRequisitionLineSaveRequest {

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

    /** 请购数量，为空默认 0。 */
    private BigDecimal reqQty;

    /** 已下单数量，为空默认 0。 */
    private BigDecimal orderedQty;

    /** 未下单数量（剩余数量），为空默认 0。 */
    private BigDecimal remainingQty;

    /** 需求日期。 */
    private LocalDateTime reqDate;

    /** 建议供应商。 */
    private String suggestedSupplier;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
