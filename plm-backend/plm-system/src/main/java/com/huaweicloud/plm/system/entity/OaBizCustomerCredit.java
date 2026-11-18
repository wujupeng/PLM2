package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 客户授信申请（OA-DEV-062）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_customer_credit")
public class OaBizCustomerCredit extends BaseEntity {

    /** 授信单号。 */
    private String creditNo;

    private String customerCode;

    private String customerName;

    /** 授信类型：NEW/ADJUST 等。 */
    private String creditType;

    private BigDecimal applyAmount;

    private BigDecimal creditLimit;

    private String currency;

    private Integer creditDays;

    private LocalDate validFrom;

    private LocalDate validTo;

    private String riskLevel;

    private String riskOpinion;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
