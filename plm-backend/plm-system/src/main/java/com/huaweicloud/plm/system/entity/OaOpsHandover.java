package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 完成知识转移和质保（OA-DEV-121）：运维交接交付物、质保期与验收确认记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_ops_handover")
public class OaOpsHandover extends BaseEntity {

    /** 交接编号。 */
    private String handoverNo;

    /** 交接名称。 */
    private String handoverName;

    /** 交付物类型：SOURCE/DOC/ENV。 */
    private String deliverableType;

    /** 交付物说明。 */
    private String deliverableDesc;

    /** 交付位置。 */
    private String location;

    /** 交接状态：PENDING/DELIVERED/CONFIRMED。 */
    private String handoverStatus;

    /** 交付时间。 */
    private LocalDateTime deliveredTime;

    /** 接收人。 */
    private String receiver;

    /** 确认时间。 */
    private LocalDateTime confirmTime;

    /** 质保月数。 */
    private Integer warrantyMonths;

    /** 质保开始时间。 */
    private LocalDateTime warrantyStart;

    /** 质保结束时间。 */
    private LocalDateTime warrantyEnd;

    /** 是否验收确认：0 否 / 1 是。 */
    private Integer acceptanceVerified;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
