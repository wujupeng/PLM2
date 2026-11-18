package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * EDI 状态通知（OA-DEV-093，接收报文状态、失败告警与交付异常，关联 OA 待办）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_edi_notice")
public class OaEdiNotice extends BaseEntity {

    /** 通知编号。 */
    private String noticeNo;

    /** 报文ID。 */
    private String messageId;

    /** 伙伴编码。 */
    private String partnerCode;

    /** 伙伴名称。 */
    private String partnerName;

    /** 关联订单号。 */
    private String orderNo;

    /** 通知类型：STATUS/ALERT/DELIVERY。 */
    private String noticeType;

    /** 通知状态描述。 */
    private String noticeStatus;

    /** 是否异常告警：0/1。 */
    private Integer alertFlag;

    /** 是否生成待办：0/1。 */
    private Integer todoFlag;

    /** 关联待办ID。 */
    private Long todoId;

    /** 接收时间。 */
    private LocalDateTime receivedTime;

    /** 处理人用户ID。 */
    private Long handleUserId;

    /** 处理人姓名。 */
    private String handleUserName;

    /** 处理状态：PENDING/HANDLED。 */
    private String handleStatus;

    /** 处理说明。 */
    private String handleRemark;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
