package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存调拨头保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryTransferSaveRequest {

    /** 调拨单号（为空时自动生成）。 */
    private String transferNo;

    /** 调拨类型，为空默认 DIRECT。 */
    private String transferType;

    /** 调出仓库编码。 */
    private String fromWarehouseCode;

    /** 调出仓库名称。 */
    private String fromWarehouseName;

    /** 调入仓库编码。 */
    private String toWarehouseCode;

    /** 调入仓库名称。 */
    private String toWarehouseName;

    /** 经办人。 */
    private String transferBy;

    /** 调拨日期。 */
    private LocalDateTime transferDate;

    /** 合计调拨数量，为空默认 0。 */
    private BigDecimal totalQty;

    /** 调拨状态，为空默认 DRAFT。 */
    private String transferStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
