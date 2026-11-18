package com.huaweicloud.plm.system.dto;

import java.time.LocalDate;
import lombok.Data;

/**
 * 变更通知与图纸补发保存入参（OA-DEV-076）。通知对象、版本、签收证据完整可追溯。
 */
@Data
public class BizChangeNoticeSaveRequest {

    /** 通知类型：oa_change_notice_type（NOTICE/REDRAW）。 */
    private String noticeType;

    /** 变更来源：oa_data_source 或 ECR 等来源编码。 */
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

    /** 接收人用户 ID，多个以逗号分隔。 */
    private String receiverUserIds;

    private String receiverNames;

    /** 是否需签收：1=需签收，0=仅知会。 */
    private Integer needReceipt;

    private String attachmentJson;

    private String remark;

    private Boolean submit;
}
