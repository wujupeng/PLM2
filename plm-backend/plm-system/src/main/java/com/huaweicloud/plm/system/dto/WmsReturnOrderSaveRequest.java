package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产退料单保存请求（对应生产退料单）。
 */
@Data
public class WmsReturnOrderSaveRequest {

    /** 退料单号（为空时自动生成）。 */
    private String returnNo;

    /** 退料类型，为空默认 RETURN（RETURN 生产退料 / SURPLUS 余料回库）。 */
    private String returnType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
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

    /** 退料状态，为空默认 DRAFT。 */
    private String returnStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

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
