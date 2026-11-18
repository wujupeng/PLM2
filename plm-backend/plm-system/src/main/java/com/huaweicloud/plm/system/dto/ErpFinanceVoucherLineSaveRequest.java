package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 记账凭证分录行保存请求（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）。
 * 凭证ID由服务端赋值，不在请求中提供。
 */
@Data
public class ErpFinanceVoucherLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    /** 科目编码。 */
    @NotBlank(message = "科目编码不能为空")
    private String accountCode;

    /** 科目名称。 */
    private String accountName;

    /** 摘要。 */
    private String summary;

    /** 借方金额，为空默认 0。 */
    private BigDecimal debitAmount;

    /** 贷方金额，为空默认 0。 */
    private BigDecimal creditAmount;

    /** 币种编码，为空默认 CNY。 */
    private String currencyCode;

    /** 汇率，为空默认 1。 */
    private BigDecimal exchangeRate;

    /** 部门编码。 */
    private String deptCode;

    /** 项目编码。 */
    private String projectCode;

    /** 物料编码。 */
    private String materialCode;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
