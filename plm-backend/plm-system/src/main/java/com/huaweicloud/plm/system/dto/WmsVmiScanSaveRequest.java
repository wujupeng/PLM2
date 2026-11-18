package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VMI 扫码收发保存请求。
 */
@Data
public class WmsVmiScanSaveRequest {

    /** 扫码单号（为空时自动生成）。 */
    private String scanNo;

    /** 扫码类型，为空默认 IN。 */
    private String scanType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 托盘号。 */
    private String palletNo;

    /** 扫码数量。 */
    private BigDecimal scanQty;

    /** 结存数量。 */
    private BigDecimal onHandQty;

    /** 扫码状态，为空默认 DRAFT。 */
    private String scanStatus;

    /** 操作人。 */
    private String operator;

    /** 扫码时间。 */
    private LocalDateTime scanTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
