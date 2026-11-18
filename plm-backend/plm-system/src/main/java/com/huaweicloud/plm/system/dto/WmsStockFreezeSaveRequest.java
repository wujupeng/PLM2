package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存冻结保存请求（对应库存冻结）。
 */
@Data
public class WmsStockFreezeSaveRequest {

    /** 冻结单号（为空时自动生成）。 */
    private String freezeNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 冻结数量。 */
    private BigDecimal freezeQty;

    /** 冻结类型，为空默认 FREEZE。 */
    private String freezeType;

    /** 冻结原因。 */
    private String freezeReason;

    /** 冻结状态，为空默认 FROZEN。 */
    private String freezeStatus;

    /** 申请人。 */
    private String applyBy;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 释放人。 */
    private String releaseBy;

    /** 释放时间。 */
    private LocalDateTime releaseTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
