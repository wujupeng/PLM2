package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 生产管理—生产订单行（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 记录生产订单行的子件物料、需求/已领/已发料与剩余数量及仓库等信息，
 * 隶属生产订单头 {@link ErpProductionOrder}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_production_order_line")
public class ErpProductionOrderLine extends BaseEntity {

    /** 所属生产订单头 ID。 */
    private Long orderId;

    /** 所属生产订单号（冗余，便于查询展示）。 */
    private String orderNo;

    /** 行号。 */
    private Integer lineNo;

    /** 行状态，默认 OPEN。 */
    private String lineStatus;

    /** 子件物料编码。 */
    private String materialCode;

    /** 子件物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 需求数量，默认 0。 */
    private BigDecimal requiredQty;

    /** 已领数量，默认 0。 */
    private BigDecimal issuedQty;

    /** 已发料数量，默认 0。 */
    private BigDecimal pickedQty;

    /** 剩余数量，默认 0。 */
    private BigDecimal remainingQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
