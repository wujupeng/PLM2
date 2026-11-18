package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 财务—会计科目（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）：
 * 维护科目编码、名称、科目类型与余额方向，支撑总账与凭证核算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_account")
public class ErpFinanceAccount extends BaseEntity {

    /** 科目编码（唯一，由用户指定）。 */
    private String accountCode;

    /** 科目名称。 */
    private String accountName;

    /** 科目类型，默认 ASSET。 */
    private String accountType;

    /** 余额方向，默认 DEBIT。 */
    private String balanceDirection;

    /** 上级科目编码。 */
    private String parentCode;

    /** 科目层级，默认 1。 */
    private Integer levelNo;

    /** 是否末级科目，默认 1。 */
    private Integer isLeaf;

    /** 币种编码，默认 CNY。 */
    private String currencyCode;

    /** 科目状态，默认 ACTIVE。 */
    private String accountStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
