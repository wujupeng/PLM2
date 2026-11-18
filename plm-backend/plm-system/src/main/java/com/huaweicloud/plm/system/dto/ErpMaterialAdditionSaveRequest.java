package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产补料单保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpMaterialAdditionSaveRequest {

    /** 补料单号（为空时自动生成）。 */
    private String additionNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 补料类型，为空默认 NORMAL。 */
    private String additionType;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，为空默认 PCS。 */
    private String uom;

    /** 补料数量，为空默认 0。 */
    private BigDecimal additionQty;

    /** 补料原因。 */
    private String additionReason;

    /** 超领原因。 */
    private String overIssueReason;

    /** 审批状态，为空默认 PENDING。 */
    private String approvalStatus;

    /** 补料人。 */
    private String additionBy;

    /** 补料日期。 */
    private LocalDateTime additionDate;

    /** 补料状态，为空默认 DRAFT。 */
    private String additionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
