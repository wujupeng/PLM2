package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 办公用品申请（OA-DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_office_supply_request")
public class OaOfficeSupplyRequest extends BaseEntity {

    /** 申请单号。 */
    private String requestNo;

    /** 需求日期。 */
    private LocalDate requireDate;

    /** 用途。 */
    private String purpose;

    /** 明细项数。 */
    private Integer itemCount;

    /** 合计数量。 */
    private BigDecimal totalQty;

    /** 发放状态：DRAFT/PARTIAL/ISSUED 等。 */
    private String issueStatus;

    /** 领用人姓名。 */
    private String receiverName;

    /** 发放时间。 */
    private LocalDateTime issueTime;

    /** 发放备注。 */
    private String issueRemark;

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
