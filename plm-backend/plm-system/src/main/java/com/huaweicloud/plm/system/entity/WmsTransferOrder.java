package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 调拨单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_transfer_order")
public class WmsTransferOrder extends BaseEntity {

    /** 调拨单号。 */
    private String transferNo;

    /** 调拨类型，默认 WAREHOUSE。 */
    private String transferType;

    /** 物料编码。 */
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

    /** 调拨状态，默认 DRAFT。 */
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

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
