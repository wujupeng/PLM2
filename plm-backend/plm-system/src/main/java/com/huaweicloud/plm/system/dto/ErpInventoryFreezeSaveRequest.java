package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 库存冻结单保存请求（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）。
 */
@Data
public class ErpInventoryFreezeSaveRequest {

    /** 冻结单号（为空时自动生成）。 */
    private String freezeNo;

    /** 冻结类型，为空默认 MANUAL。 */
    private String freezeType;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 单位，为空默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码，为空默认 ""。 */
    private String locationCode;

    /** 批次号，为空默认 ""。 */
    private String batchNo;

    /** 冻结数量，为空默认 0。 */
    private BigDecimal freezeQty;

    /** 冻结原因。 */
    private String freezeReason;

    /** 冻结人。 */
    private String freezeBy;

    /** 冻结日期。 */
    private LocalDateTime freezeDate;

    /** 解冻日期。 */
    private LocalDateTime unfreezeDate;

    /** 冻结状态，为空默认 FROZEN。 */
    private String freezeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
