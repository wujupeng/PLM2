package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 供应商回执请求（N6，DEV-071）。
 */
@Data
public class EdiAckRequest {

    @NotBlank(message = "分发编号不能为空")
    private String dispatchNo;

    /** 供应商编码，为空时取分发记录的供应商。 */
    private String supplierCode;

    /** 回执类型：CONFIRM/PROVIDE/SHORTAGE/REJECT/EXCEPTION，为空默认 CONFIRM。 */
    private String ackType;

    /** 确认数量，为空时取分发数量。 */
    private BigDecimal confirmedQty;

    /** 确认交期。 */
    private LocalDate confirmedDate;

    /** 缺口数量。 */
    private BigDecimal shortageQty;

    /** 缺口原因。 */
    private String shortageReason;

    /** 异常说明。 */
    private String exceptionText;

    /** 来源：API/MAIL/EDI，为空默认 API。 */
    private String source;

    private String remark;
}
