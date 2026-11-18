package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * EDI 报文保存请求（对应 EDI 报文）。
 */
@Data
public class SrmEdiMessageSaveRequest {

    /** EDI 报文编号（为空时自动生成）。 */
    private String ediNo;

    /** 合作方编码。 */
    @NotBlank(message = "合作方编码不能为空")
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 方向：OUTBOUND/INBOUND，为空默认 OUTBOUND。 */
    private String direction;

    /** 报文类型：DEMAND/FORECAST/ORDER/CHANGE/ASN/INVOICE，为空默认 ORDER。 */
    private String messageType;

    /** 关联业务单号。 */
    private String bizNo;

    /** 报文格式：EDIFACT/X12/XML/JSON/CSV，为空默认 XML。 */
    private String messageFormat;

    /** 报文内容。 */
    private String payload;

    /** 发送时间。 */
    private LocalDateTime sendTime;

    /** 回执状态，为空默认 DRAFT。 */
    private String ackStatus;

    /** 回执时间。 */
    private LocalDateTime ackTime;

    /** 回执代码。 */
    private String ackCode;

    /** 重试次数，为空默认 0。 */
    private Integer retryCount;

    /** 最后重试时间。 */
    private LocalDateTime lastRetryTime;

    /** 下次重试时间。 */
    private LocalDateTime nextRetryTime;

    /** 报文状态，为空默认 DRAFT。 */
    private String messageStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
