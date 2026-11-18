package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 来料质量保存请求（对应来料质量）。
 */
@Data
public class SrmIncomingQualitySaveRequest {

    /** 来料检验单号（为空时自动生成）。 */
    private String iqcNo;

    /** 采购订单号。 */
    private String poNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 收货数量。 */
    private BigDecimal receiveQty;

    /** 单位。 */
    private String unit;

    /** 抽检数量。 */
    private BigDecimal sampleQty;

    /** 不良数量。 */
    private BigDecimal defectQty;

    /** 不良率%。 */
    private BigDecimal defectRate;

    /** 检验结果，为空默认 PENDING。 */
    private String inspectionResult;

    /** 不良描述。 */
    private String defectDesc;

    /** 检验员。 */
    private String inspector;

    /** 检验日期。 */
    private LocalDate inspectDate;

    /** 检验状态，为空默认 DRAFT。 */
    private String iqcStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
