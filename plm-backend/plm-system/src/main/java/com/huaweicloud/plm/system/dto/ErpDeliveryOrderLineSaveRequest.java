package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 发货单行保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpDeliveryOrderLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 来源销售订单行号。 */
    private Integer orderLineNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 发货数量，为空默认 0。 */
    private BigDecimal deliveryQty;

    /** 批次号。 */
    private String batchNo;

    /** 发货仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
