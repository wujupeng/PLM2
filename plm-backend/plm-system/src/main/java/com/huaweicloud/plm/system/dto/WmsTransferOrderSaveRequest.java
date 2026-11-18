package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 调拨单保存请求。
 */
@Data
public class WmsTransferOrderSaveRequest {

    /** 调拨单号（为空时自动生成）。 */
    private String transferNo;

    /** 调拨类型，为空默认 WAREHOUSE。 */
    private String transferType;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 调出仓库编码。 */
    private String fromWarehouseCode;

    /** 调出库位编码。 */
    private String fromBinCode;

    /** 调入仓库编码。 */
    private String toWarehouseCode;

    /** 调入库位编码。 */
    private String toBinCode;

    /** 调拨数量。 */
    private BigDecimal transferQty;

    /** 已收数量。 */
    private BigDecimal receivedQty;

    /** 调拨状态，为空默认 DRAFT。 */
    private String transferStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 调出人。 */
    private String transferBy;

    /** 调出时间。 */
    private LocalDateTime transferTime;

    /** 收货人。 */
    private String receiveBy;

    /** 收货时间。 */
    private LocalDateTime receiveTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
