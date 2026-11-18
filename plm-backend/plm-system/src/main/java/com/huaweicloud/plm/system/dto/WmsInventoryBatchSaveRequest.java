package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 库存批次保存请求（对应库存批次）。
 */
@Data
public class WmsInventoryBatchSaveRequest {

    /** 库存批次号（为空时自动生成）。 */
    private String batchNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String zoneCode;

    /** 库位编码。 */
    private String binCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 收货单号。 */
    private String receiptNo;

    /** 批次来源，为空默认 PURCHASE。 */
    private String batchSource;

    /** 生产日期。 */
    private LocalDate productionDate;

    /** 失效日期。 */
    private LocalDate expiryDate;

    /** 入库日期。 */
    private LocalDate inboundDate;

    /** 数量。 */
    private BigDecimal qty;

    /** 可用数量。 */
    private BigDecimal availableQty;

    /** 冻结数量。 */
    private BigDecimal frozenQty;

    /** 批次状态，为空默认 NORMAL。 */
    private String batchStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
