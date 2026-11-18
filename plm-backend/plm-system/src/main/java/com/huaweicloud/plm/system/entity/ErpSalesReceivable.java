package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 销售管理—应收账款（G3-N2 ERP 销售管理）：
 * 记录客户应收账款对应的发票、订单、应收金额、已收金额、余额与到期日等信息，
 * 供销售、财务进行应收管理与账龄分析。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_sales_receivable")
public class ErpSalesReceivable extends BaseEntity {

    /** 应收单编号（唯一，支持人工指定，为空时自动生成）。 */
    private String arNo;

    /** 关联销售发票编号。 */
    private String invoiceNo;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 应收金额，默认 0。 */
    private BigDecimal arAmount;

    /** 已收金额，默认 0。 */
    private BigDecimal receivedAmount;

    /** 应收余额，默认 0。 */
    private BigDecimal arBalance;

    /** 到期日期。 */
    private LocalDateTime dueDate;

    /** 应收状态，默认 OPEN。 */
    private String arStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
