package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购入库单保存请求（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpPurchaseInboundSaveRequest {

    /** 入库单号（为空时自动生成）。 */
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

    /** 入库数量，为空默认 0。 */
    private BigDecimal inboundQty;

    /** 批次号。 */
    private String batchNo;

    /** 操作人。 */
    private String operatorName;

    /** 入库状态，为空默认 DRAFT。 */
    private String inboundStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
