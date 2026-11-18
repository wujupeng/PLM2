package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 委外管理—委外到货单行（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外到货行的物料、到货数量、批次与检验结论等信息，隶属委外到货单头 {@link ErpOutsourceReceipt}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_receipt_line")
public class ErpOutsourceReceiptLine extends BaseEntity {

    /** 所属委外到货单头 ID。 */
    private Long receiptId;

    /** 所属委外到货单号（冗余，便于查询展示）。 */
    private String receiptNo;

    /** 行号。 */
    private Integer lineNo;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 关联委外订单行号。 */
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

    /** 检验结论，默认 PENDING。 */
    private String inspectionResult;

    /** 备注。 */
    private String remark;
}
