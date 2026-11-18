package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 会计科目保存请求（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）。
 */
@Data
public class ErpFinanceAccountSaveRequest {

    /** 科目编码。 */
    @NotBlank(message = "科目编码不能为空")
    private String accountCode;

    /** 科目名称。 */
    private String accountName;

    /** 科目类型，为空默认 ASSET。 */
    private String accountType;

    /** 余额方向，为空默认 DEBIT。 */
    private String balanceDirection;

    /** 上级科目编码。 */
    private String parentCode;

    /** 科目层级，为空默认 1。 */
    private Integer levelNo;

    /** 是否末级科目，为空默认 1。 */
    private Integer isLeaf;

    /** 币种编码，为空默认 CNY。 */
    private String currencyCode;

    /** 科目状态，为空默认 ACTIVE。 */
    private String accountStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
