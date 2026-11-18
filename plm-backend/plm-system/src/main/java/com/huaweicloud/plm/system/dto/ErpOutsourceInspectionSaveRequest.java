package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外报检单保存请求（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceInspectionSaveRequest {

    /** 报检单号（为空时自动生成）。 */
    private String inspectionNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 检验类型，为空默认 FULL。 */
    private String inspectionType;

    /** 报检数量，为空默认 0。 */
    private BigDecimal inspectionQty;

    /** 合格数量，为空默认 0。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量，为空默认 0。 */
    private BigDecimal rejectedQty;

    /** 检验结果，为空默认 PENDING。 */
    private String inspectionResult;

    /** 检验员。 */
    private String inspector;

    /** 检验日期。 */
    private LocalDateTime inspectionDate;

    /** 报检单状态，为空默认 OPEN。 */
    private String inspectionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
