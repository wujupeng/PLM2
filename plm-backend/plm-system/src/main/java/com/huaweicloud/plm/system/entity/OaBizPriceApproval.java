package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 价格审批（OA-DEV-063 销售价格 / OA-DEV-071 零件价格）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_price_approval")
public class OaBizPriceApproval extends BaseEntity {

    /** 价格审批单号。 */
    private String priceNo;

    /** 价格类别：SALES/PART 等。 */
    private String priceCategory;

    /** 变更类型：NEW/CHANGE 等。 */
    private String changeType;

    private String materialCode;

    private String materialName;

    private String customerCode;

    private String customerName;

    private String supplierCode;

    private String supplierName;

    private BigDecimal priceAmount;

    private BigDecimal oldPrice;

    private String currency;

    private String priceUnit;

    private LocalDate effectiveFrom;

    private LocalDate effectiveTo;

    private String costBasis;

    private String approvalOpinion;

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
