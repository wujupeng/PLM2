package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 合同（OA-DEV-080）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_contract")
public class OaContract extends BaseEntity {

    /** 合同编号。 */
    private String contractNo;

    /** 合同名称。 */
    private String contractName;

    /** 合同类型：SALES/PURCHASE 等。 */
    private String contractType;

    /** 客户编码。 */
    private String customerCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 甲方。 */
    private String partyA;

    /** 乙方。 */
    private String partyB;

    /** 合同金额。 */
    private BigDecimal amount;

    /** 币种。 */
    private String currency;

    /** 签订日期。 */
    private LocalDate signDate;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 到期日期。 */
    private LocalDate expireDate;

    /** 合同状态：DRAFT/REVIEWING/EFFECTIVE/EXPIRED/ARCHIVED 等。 */
    private String contractStatus;

    /** 法务评审标记：0 否，1 是。 */
    private Integer legalReviewFlag;

    /** 评审意见。 */
    private String reviewOpinion;

    /** 当前版本号。 */
    private Integer currentVersion;

    /** 归档时间。 */
    private LocalDateTime archiveTime;

    /** 申请人用户ID。 */
    private Long applicantUserId;

    /** 申请人姓名。 */
    private String applicantName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 附件JSON。 */
    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    /** 流程实例ID。 */
    private Long instanceId;

    /** 流程实例编号。 */
    private String instanceNo;

    /** 取消标记：0 否，1 是。 */
    private Integer cancelFlag;

    /** 备注。 */
    private String remark;
}
