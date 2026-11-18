package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * SRM EDI 协同—EDI 报文：登记 EDI 报文编号、合作方、方向与报文类型、关联业务单号、
 * 报文格式与内容、发送与回执信息、重试次数与下次重试时间及报文状态，支撑 EDI 报文收发追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_edi_message")
public class SrmEdiMessage extends BaseEntity {

    /** EDI 报文编号（为空时自动生成）。 */
    private String ediNo;

    /** 合作方编码。 */
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 方向：OUTBOUND/INBOUND，默认 OUTBOUND。 */
    private String direction;

    /** 报文类型：DEMAND/FORECAST/ORDER/CHANGE/ASN/INVOICE，默认 ORDER。 */
    private String messageType;

    /** 关联业务单号。 */
    private String bizNo;

    /** 报文格式：EDIFACT/X12/XML/JSON/CSV，默认 XML。 */
    private String messageFormat;

    /** 报文内容。 */
    private String payload;

    /** 发送时间。 */
    private LocalDateTime sendTime;

    /** 回执状态，默认 DRAFT。 */
    private String ackStatus;

    /** 回执时间。 */
    private LocalDateTime ackTime;

    /** 回执代码。 */
    private String ackCode;

    /** 重试次数，默认 0。 */
    private Integer retryCount;

    /** 最后重试时间。 */
    private LocalDateTime lastRetryTime;

    /** 下次重试时间。 */
    private LocalDateTime nextRetryTime;

    /** 报文状态，默认 DRAFT。 */
    private String messageStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
