package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 变更通知与图纸补发（OA-DEV-076）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_change_notice")
public class OaBizChangeNotice extends BaseEntity {

    /** 通知单号。 */
    private String noticeNo;

    /** 通知类型：NOTICE 等。 */
    private String noticeType;

    /** 变更来源：OA/PLM 等。 */
    private String changeSource;

    private String sourceRefNo;

    private String materialCode;

    private String materialName;

    private String docCode;

    private String docName;

    private String docVersion;

    private String noticeTitle;

    private String noticeContent;

    private LocalDate effectiveDate;

    /** 接收人用户 ID 列表（逗号分隔）。 */
    private String receiverUserIds;

    private String receiverNames;

    private Integer receiptCount;

    /** 是否需要回执：0/1。 */
    private Integer needReceipt;

    private Long publisherUserId;

    private String publisherName;

    private Long orgId;

    private String orgName;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
