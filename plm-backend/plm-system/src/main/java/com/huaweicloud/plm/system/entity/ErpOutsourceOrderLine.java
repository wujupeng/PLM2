package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外订单行（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外订单行的加工物料、数量、单价税率与需求日期等信息，隶属委外订单头 {@link ErpOutsourceOrder}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_order_line")
public class ErpOutsourceOrderLine extends BaseEntity {

    /** 所属委外订单头 ID。 */
    private Long orderId;

    /** 所属委外订单号（冗余，便于查询展示）。 */
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

    /** 已发料数量，默认 0。 */
    private BigDecimal issuedQty;

    /** 已收货数量，默认 0。 */
    private BigDecimal receivedQty;

    /** 剩余数量，默认 0。 */
    private BigDecimal remainingQty;

    /** 单价，默认 0。 */
    private BigDecimal unitPrice;

    /** 税率，默认 0。 */
    private BigDecimal taxRate;

    /** 金额，默认 0。 */
    private BigDecimal amount;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
