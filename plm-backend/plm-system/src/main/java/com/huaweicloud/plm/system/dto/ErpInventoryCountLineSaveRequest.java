package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 库存盘点行保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 * 盘点头ID与盘点单号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpInventoryCountLineSaveRequest {

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

    /** 库位编码，为空默认空串。 */
    private String locationCode;

    /** 批次号，为空默认空串。 */
    private String batchNo;

    /** 账面数量，为空默认 0。 */
    private BigDecimal bookQty;

    /** 实盘数量，为空默认 0。 */
    private BigDecimal actualQty;

    /** 差异数量，为空默认 0。 */
    private BigDecimal diffQty;

    /** 备注。 */
    private String remark;
}
