package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 变更通知回执（OA-DEV-076）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_change_notice_receipt")
public class OaBizChangeNoticeReceipt extends BaseEntity {

    /** 所属通知单 ID。 */
    private Long noticeId;

    private Long receiverUserId;

    private String receiverName;

    /** 回执状态：PENDING/RECEIVED 等。 */
    private String receiptStatus;

    private LocalDateTime receiptTime;

    private String receiptRemark;
}
