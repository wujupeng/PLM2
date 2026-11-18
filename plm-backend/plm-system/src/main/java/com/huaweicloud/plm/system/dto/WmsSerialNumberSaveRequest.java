package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 序列号保存请求（对应序列号）。
 */
@Data
public class WmsSerialNumberSaveRequest {

    /** 序列号（为空时自动生成）。 */
    private String serialNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 入库单号。 */
    private String receiptNo;

    /** 入库时间。 */
    private LocalDateTime inboundTime;

    /** 客户编码。 */
    private String customerCode;

    /** 出库时间。 */
    private LocalDateTime outboundTime;

    /** 序列号状态，为空默认 IN_STOCK。 */
    private String serialStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
