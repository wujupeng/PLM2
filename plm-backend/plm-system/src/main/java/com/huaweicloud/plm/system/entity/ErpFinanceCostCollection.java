package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * ERP 财务—成本归集（对应 WBS T028 ERP 财务，属 G3-N6 ERP 财务）：
 * 按期间归集归集对象（产品等）的成本要素金额，支撑成本核算与结转。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_finance_cost_collection")
public class ErpFinanceCostCollection extends BaseEntity {

    /** 归集单号（唯一，为空时自动生成）。 */
    private String collectionNo;

    /** 会计期间编码。 */
    private String periodCode;

    /** 归集对象类型，默认 PRODUCT。 */
    private String objectType;

    /** 归集对象编码。 */
    private String objectCode;

    /** 归集对象名称。 */
    private String objectName;

    /** 成本要素，默认 MATERIAL。 */
    private String costElement;

    /** 归集金额，默认 0。 */
    private BigDecimal amount;

    /** 币种，默认 CNY。 */
    private String currencyCode;

    /** 归集日期。 */
    private LocalDate collectionDate;

    /** 归集状态，默认 DRAFT。 */
    private String collectionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
