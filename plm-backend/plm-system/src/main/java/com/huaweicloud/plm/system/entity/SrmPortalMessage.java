package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商门户—门户消息：登记消息编号、供应商、消息类型与标题内容、关联业务单号、
 * 已读标志、发送人与发送日期及消息状态与组织，支撑门户消息的投递与已读追踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_portal_message")
public class SrmPortalMessage extends BaseEntity {

    /** 消息编号（为空时自动生成）。 */
    private String messageNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 消息类型：ORDER/DELIVERY/ASN/QUALITY/ANNOUNCE，默认 SYSTEM。 */
    private String messageType;

    /** 消息标题。 */
    private String title;

    /** 消息内容。 */
    private String content;

    /** 关联业务单号。 */
    private String bizNo;

    /** 已读标志：0 未读 1 已读，默认 0。 */
    private Integer readFlag;

    /** 发送人。 */
    private String sender;

    /** 发送日期。 */
    private LocalDate sendDate;

    /** 消息状态，默认 DRAFT。 */
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
