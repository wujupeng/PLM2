package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 交期延误协调单（OA-DEV-064）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_delivery_coordination")
public class OaBizDeliveryCoordination extends BaseEntity {

    /** 协调单号。 */
    private String coordNo;

    private String orderNo;

    private String customerCode;

    private String customerName;

    private String materialCode;

    private String materialName;

    private BigDecimal demandQty;

    private LocalDate originalDelivery;

    private LocalDate promisedDelivery;

    private Integer delayDays;

    private String delayReason;

    private String capacityNote;

    private String shortageReason;

    private String responsibleDept;

    private Long responsibleUserId;

    private String responsibleName;

    private String correctiveAction;

    /** 关闭状态：OPEN/CLOSED。 */
    private String closeStatus;

    private LocalDateTime closeTime;

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
