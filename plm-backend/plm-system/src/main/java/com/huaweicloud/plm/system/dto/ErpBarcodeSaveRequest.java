package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 条码生成保存请求（对应 WBS G3-N7a ERP 条码管理）。
 */
@Data
public class ErpBarcodeSaveRequest {

    /** 条码号（为空时自动生成）。 */
    private String barcodeNo;

    /** 条码类型，为空默认 MATERIAL。 */
    private String barcodeType;

    /** 业务单号。 */
    private String bizNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 数量，为空默认 0。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 标签模板编码。 */
    private String templateCode;

    /** 打印状态，为空默认 UNPRINTED。 */
    private String printStatus;

    /** 打印次数，为空默认 0。 */
    private Integer printCount;

    /** 打印时间。 */
    private LocalDateTime printTime;

    /** 打印机。 */
    private String printer;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
