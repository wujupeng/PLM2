package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 委外核销单保存请求（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）。
 */
@Data
public class ErpOutsourceWriteoffSaveRequest {

    /** 核销单号（为空时自动生成）。 */
    private String writeoffNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 委外结算单号。 */
    private String settlementNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 累计发料数量，为空默认 0。 */
    private BigDecimal issuedQty;

    /** 累计到货数量，为空默认 0。 */
    private BigDecimal receivedQty;

    /** 损耗数量，为空默认 0。 */
    private BigDecimal lossQty;

    /** 结存数量，为空默认 0。 */
    private BigDecimal balanceQty;

    /** 核销日期。 */
    private LocalDateTime writeoffDate;

    /** 核销单状态，为空默认 OPEN。 */
    private String writeoffStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
