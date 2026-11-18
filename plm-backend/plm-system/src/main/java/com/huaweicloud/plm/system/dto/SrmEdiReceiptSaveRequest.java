package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * EDI 回执保存请求（对应 EDI 回执）。
 */
@Data
public class SrmEdiReceiptSaveRequest {

    /** 回执编号（为空时自动生成）。 */
    private String receiptNo;

    /** EDI 报文编号。 */
    @NotBlank(message = "EDI报文编号不能为空")
    private String ediNo;

    /** 合作方编码。 */
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 回执类型：ACK/NAK/APPLICATION，为空默认 ACK。 */
    private String receiptType;

    /** 回执代码。 */
    private String receiptCode;

    /** 回执说明。 */
    private String receiptDesc;

    /** 接收时间。 */
    private LocalDateTime receivedTime;

    /** 回执状态：RECEIVED/PROCESSED/FAILED，为空默认 RECEIVED。 */
    private String receiptStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
