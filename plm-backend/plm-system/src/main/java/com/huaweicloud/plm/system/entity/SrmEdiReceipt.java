package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * SRM EDI 协同—EDI 回执：登记回执编号、EDI 报文编号、合作方信息、回执类型与代码、
 * 回执说明、接收时间与回执状态，支撑 EDI 报文回执的接收与处理追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_edi_receipt")
public class SrmEdiReceipt extends BaseEntity {

    /** 回执编号（为空时自动生成）。 */
    private String receiptNo;

    /** EDI 报文编号。 */
    private String ediNo;

    /** 合作方编码。 */
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 回执类型：ACK/NAK/APPLICATION，默认 ACK。 */
    private String receiptType;

    /** 回执代码。 */
    private String receiptCode;

    /** 回执说明。 */
    private String receiptDesc;

    /** 接收时间。 */
    private LocalDateTime receivedTime;

    /** 回执状态：RECEIVED/PROCESSED/FAILED，默认 RECEIVED。 */
    private String receiptStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
