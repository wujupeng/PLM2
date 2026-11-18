package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 访客申请单：来访登记与签到签退记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_visitor")
public class OaHrVisitor extends BaseEntity {

    private String visitorNo;

    private String visitorName;

    private String visitorCompany;

    private String visitorPhone;

    private Integer visitorCount;

    private String visitReason;

    private String visitArea;

    private LocalDateTime visitStart;

    private LocalDateTime visitEnd;

    private Long hostUserId;

    private String hostName;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String vehicleNo;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private LocalDateTime checkinAt;

    private LocalDateTime checkoutAt;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
