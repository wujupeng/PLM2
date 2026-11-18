package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产退料单：登记退料单号、退料类型、生产工单号与物料信息、批次与仓库库位、
 * 退料/已收数量、退料原因与退料状态、申请与收货信息，支撑生产退料追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_return_order")
public class WmsReturnOrder extends BaseEntity {

    /** 退料单号。 */
    private String returnNo;

    /** 退料类型，默认 RETURN（RETURN 生产退料 / SURPLUS 余料回库）。 */
    private String returnType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 退料数量。 */
    private BigDecimal returnQty;

    /** 已收数量。 */
    private BigDecimal receivedQty;

    /** 退料原因。 */
    private String returnReason;

    /** 退料状态，默认 DRAFT。 */
    private String returnStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

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
