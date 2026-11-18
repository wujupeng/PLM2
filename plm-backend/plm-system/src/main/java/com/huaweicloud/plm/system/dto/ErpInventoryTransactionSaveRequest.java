package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存流水保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryTransactionSaveRequest {

    /** 流水单号（为空时自动生成）。 */
    private String transactionNo;

    /** 交易类型，为空默认 IN。 */
    private String transactionType;

    /** 业务类型，为空默认 MANUAL。 */
    private String bizType;

    /** 出入方向，为空默认 IN。 */
    private String direction;

    /** 来源单据号。 */
    private String bizNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码，为空默认空串。 */
    private String locationCode;

    /** 批次号，为空默认空串。 */
    private String batchNo;

    /** 数量，为空默认 0。 */
    private BigDecimal qty;

    /** 单位成本，为空默认 0。 */
    private BigDecimal unitCost;

    /** 金额，为空默认 0。 */
    private BigDecimal amount;

    /** 交易日期。 */
    private LocalDateTime transactionDate;

    /** 操作人。 */
    private String operator;

    /** 交易状态，为空默认 POSTED。 */
    private String transactionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
