package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM EDI 协同—EDI 对账：登记对账单号、合作方、对账周期与报文类型、发送/回执/失败笔数、
 * 对账结果、对账日期与对账状态，支撑 EDI 报文往来的一致性核对与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_edi_reconcile")
public class SrmEdiReconcile extends BaseEntity {

    /** 对账单号（为空时自动生成）。 */
    private String reconcileNo;

    /** 合作方编码。 */
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 对账周期。 */
    private String reconcilePeriod;

    /** 报文类型：DEMAND/FORECAST/ORDER/CHANGE/ASN/INVOICE，默认 ORDER。 */
    private String messageType;

    /** 发送笔数，默认 0。 */
    private Integer sendCount;

    /** 回执笔数，默认 0。 */
    private Integer ackCount;

    /** 失败笔数，默认 0。 */
    private Integer failCount;

    /** 对账结果。 */
    private String reconcileResult;

    /** 对账日期。 */
    private LocalDate reconcileDate;

    /** 对账状态：PENDING/MATCHED/DIFF/CONFIRMED，默认 PENDING。 */
    private String reconcileStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
