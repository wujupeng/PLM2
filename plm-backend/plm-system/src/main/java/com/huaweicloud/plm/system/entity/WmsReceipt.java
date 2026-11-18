package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * WMS 收货上架—收货单：登记收货单号、收货通知单号、供应商与仓库、收货方式与收货时间、
 * 收货人、收货/检验/合格/拒收数量及收货状态，支撑收货上架追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_receipt")
public class WmsReceipt extends BaseEntity {

    /** 收货单号（为空时自动生成）。 */
    private String receiptNo;

    /** 收货通知单号。 */
    private String asnNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 收货方式，默认 SCAN。 */
    private String receiveType;

    /** 收货时间。 */
    private LocalDateTime receiveTime;

    /** 收货人。 */
    private String operator;

    /** 收货数量。 */
    private BigDecimal totalQty;

    /** 检验数量。 */
    private BigDecimal inspectedQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 拒收数量。 */
    private BigDecimal rejectedQty;

    /** 收货状态，默认 PENDING。 */
    private String receiveStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
