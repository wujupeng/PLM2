package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—销售订单行（G3-N2 ERP 销售管理）：
 * 记录订单行的物料、数量、单价、税率与交货信息，隶属销售订单头 {@link ErpSalesOrder}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_order_line")
public class ErpSalesOrderLine extends BaseEntity {

    /** 所属销售订单头 ID。 */
    private Long orderId;

    /** 所属销售订单编号（冗余，便于查询展示）。 */
    private String orderNo;

    /** 行号。 */
    private Integer lineNo;

    /** 行状态，默认 OPEN。 */
    private String lineStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 订单数量，默认 0。 */
    private BigDecimal orderQty;

    /** 已发货数量，默认 0。 */
    private BigDecimal deliveredQty;

    /** 未发货数量（剩余数量）。 */
    private BigDecimal remainingQty;

    /** 单价，默认 0。 */
    private BigDecimal unitPrice;

    /** 税率，默认 0。 */
    private BigDecimal taxRate;

    /** 行金额，默认 0。 */
    private BigDecimal amount;

    /** 交货日期。 */
    private LocalDateTime deliveryDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
