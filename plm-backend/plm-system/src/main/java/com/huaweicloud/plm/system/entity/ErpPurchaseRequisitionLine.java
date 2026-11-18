package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—请购单行（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）：
 * 记录请购行的物料、请购数量、建议供应商与需求日期等信息，隶属请购单头 {@link ErpPurchaseRequisition}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_requisition_line")
public class ErpPurchaseRequisitionLine extends BaseEntity {

    /** 所属请购单头 ID。 */
    private Long requisitionId;

    /** 所属请购单号（冗余，便于查询展示）。 */
    private String requisitionNo;

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

    /** 请购数量，默认 0。 */
    private BigDecimal reqQty;

    /** 已下单数量，默认 0。 */
    private BigDecimal orderedQty;

    /** 未下单数量（剩余数量），默认 0。 */
    private BigDecimal remainingQty;

    /** 需求日期。 */
    private LocalDateTime reqDate;

    /** 建议供应商。 */
    private String suggestedSupplier;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 备注。 */
    private String remark;
}
