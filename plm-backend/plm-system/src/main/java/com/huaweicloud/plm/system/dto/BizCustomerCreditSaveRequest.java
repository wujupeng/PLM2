package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 客户授信申请保存入参（OA-DEV-062）。
 */
@Data
public class BizCustomerCreditSaveRequest {

    private String customerCode;

    private String customerName;

    /** 授信类型：可配置字典 oa_credit_type。 */
    private String creditType;

    private BigDecimal applyAmount;

    private BigDecimal creditLimit;

    private String currency;

    private Integer creditDays;

    private LocalDate validFrom;

    private LocalDate validTo;

    private String riskLevel;

    private String riskOpinion;

    private String attachmentJson;

    private String remark;

    /** 是否保存后直接提交审批。 */
    private Boolean submit;
}
