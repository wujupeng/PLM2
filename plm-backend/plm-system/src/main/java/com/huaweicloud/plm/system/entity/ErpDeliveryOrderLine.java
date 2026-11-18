package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 销售管理—发货单行（G3-N2 ERP 销售管理）：
 * 记录发货单下的物料、数量、批次与仓库等明细信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_delivery_order_line")
public class ErpDeliveryOrderLine extends BaseEntity {

    /** 所属发货单头 ID。 */
    private Long deliveryId;

    /** 发货单号。 */
    private String deliveryNo;

    /** 行号。 */
    private Integer lineNo;

    /** 来源销售订单号。 */
    private String orderNo;

    /** 来源销售订单行号。 */
    private Integer orderLineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 发货数量，默认 0。 */
    private BigDecimal deliveryQty;

    /** 批次号。 */
    private String batchNo;

    /** 发货仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
