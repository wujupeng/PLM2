package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购入库单（G3-N3a ERP 采购管理）：
 * 记录到货物料的入库数量、批次、仓库与操作人等信息，
 * 入库实绩由 WMS 承接，本模块登记入库指令与状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_inbound")
public class ErpPurchaseInbound extends BaseEntity {

    /** 入库单号（唯一，支持人工指定，为空时自动生成）。 */
    private String inboundNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 采购订单编号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 入库日期。 */
    private LocalDateTime inboundDate;

    /** 入库数量，默认 0。 */
    private BigDecimal inboundQty;

    /** 批次号。 */
    private String batchNo;

    /** 操作人。 */
    private String operatorName;

    /** 入库状态，默认 DRAFT。 */
    private String inboundStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
