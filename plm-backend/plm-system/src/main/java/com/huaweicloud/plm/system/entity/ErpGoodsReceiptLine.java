package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 采购管理—采购到货单行（G3-N3a ERP 采购管理）：
 * 记录到货行的物料、数量、批次与检验结果，隶属到货单头 {@link ErpGoodsReceipt}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_goods_receipt_line")
public class ErpGoodsReceiptLine extends BaseEntity {

    /** 所属到货单头 ID。 */
    private Long receiptId;

    /** 所属到货单号（冗余，便于查询展示）。 */
    private String receiptNo;

    /** 行号。 */
    private Integer lineNo;

    /** 采购订单编号。 */
    private String orderNo;

    /** 采购订单行号。 */
    private Integer orderLineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 到货数量，默认 0。 */
    private BigDecimal receiptQty;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 检验结果，默认 PENDING。 */
    private String inspectionResult;

    /** 备注。 */
    private String remark;
}
