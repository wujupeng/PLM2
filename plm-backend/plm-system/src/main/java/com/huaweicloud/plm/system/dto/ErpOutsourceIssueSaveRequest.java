package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外发料单头保存请求（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceIssueSaveRequest {

    /** 委外发料单号（为空时自动生成）。 */
    private String issueNo;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 加工商编码。 */
    @NotBlank(message = "加工商编码不能为空")
    private String supplierCode;

    /** 加工商名称。 */
    private String supplierName;

    /** 发料日期。 */
    private LocalDateTime issueDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 发料人。 */
    private String issuer;

    /** 发料单状态，为空默认 DRAFT。 */
    private String issueStatus;

    /** 发料总数量，为空默认 0。 */
    private BigDecimal totalQty;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
