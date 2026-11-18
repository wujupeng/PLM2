package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.Data;

/**
 * 合同保存入参（OA-DEV-080）。
 */
@Data
public class BizContractSaveRequest {

    private String contractName;

    /** 合同类型：可配置字典 oa_contract_type。 */
    private String contractType;

    private String customerCode;

    private String supplierCode;

    private String partyA;

    private String partyB;

    private BigDecimal amount;

    private String currency;

    private LocalDate signDate;

    private LocalDate effectiveDate;

    private LocalDate expireDate;

    /** 是否需要法务评审。 */
    private Boolean legalReviewFlag;

    private String attachmentJson;

    private String remark;

    /** 是否保存后直接提交审批。 */
    private Boolean submit;
}
