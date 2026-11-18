package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 库存调拨行保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * 调拨头ID与调拨单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpInventoryTransferLineSaveRequest {

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

    /** 批次号，为空默认空串。 */
    private String batchNo;

    /** 调出库位编码，为空默认空串。 */
    private String fromLocationCode;

    /** 调入库位编码，为空默认空串。 */
    private String toLocationCode;

    /** 调拨数量，为空默认 0。 */
    private BigDecimal transferQty;

    /** 备注。 */
    private String remark;
}
