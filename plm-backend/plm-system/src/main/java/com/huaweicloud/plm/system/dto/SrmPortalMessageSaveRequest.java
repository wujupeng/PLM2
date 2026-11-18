package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 门户消息保存请求（对应门户消息）。
 */
@Data
public class SrmPortalMessageSaveRequest {

    /** 消息编号（为空时自动生成）。 */
    private String messageNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 消息类型：ORDER/DELIVERY/ASN/QUALITY/ANNOUNCE，为空默认 SYSTEM。 */
    private String messageType;

    /** 消息标题。 */
    @NotBlank(message = "消息标题不能为空")
    private String title;

    /** 消息内容。 */
    private String content;

    /** 关联业务单号。 */
    private String bizNo;

    /** 已读标志：0 未读 1 已读，为空默认 0。 */
    private Integer readFlag;

    /** 发送人。 */
    private String sender;

    /** 发送日期。 */
    private LocalDate sendDate;

    /** 消息状态，为空默认 DRAFT。 */
    private String messageStatus;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
