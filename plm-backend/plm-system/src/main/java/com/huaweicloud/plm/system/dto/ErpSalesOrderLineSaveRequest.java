package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 销售订单行保存请求（G3-N2 ERP 销售管理）。
 * 订单ID与订单编号由服务端赋值，不在请求中提供。
 */
@Data
public class ErpSalesOrderLineSaveRequest {

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

    /** 订单数量，为空默认 0。 */
    private BigDecimal orderQty;

    /** 已发货数量，为空默认 0。 */
    private BigDecimal deliveredQty;

    /** 未发货数量（剩余数量），为空时按订单数量取值。 */
    private BigDecimal remainingQty;

    /** 单价，为空默认 0。 */
    private BigDecimal unitPrice;

    /** 税率，为空默认 0。 */
    private BigDecimal taxRate;

    /** 行金额，为空默认 0。 */
    private BigDecimal amount;

    /** 交货日期。 */
    private LocalDateTime deliveryDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
