package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 采购报检/检验单保存请求（G3-N3a ERP 采购管理）。
 */
@Data
public class ErpPurchaseInspectionSaveRequest {

    /** 检验单号（为空时自动生成）。 */
    private String inspectionNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 采购订单编号。 */
    private String orderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 检验类型，为空默认 FULL。 */
    private String inspectionType;

    /** 检验数量，为空默认 0。 */
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

    /** 检验状态，为空默认 OPEN。 */
    private String inspectionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
