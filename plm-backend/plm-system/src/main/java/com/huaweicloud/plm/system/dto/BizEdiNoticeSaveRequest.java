package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * EDI 状态通知入参（OA-DEV-093）。
 */
@Data
public class BizEdiNoticeSaveRequest {

    private String noticeNo;

    private String messageId;

    private String partnerCode;

    private String partnerName;

    private String orderNo;

    /** 通知类型：STATUS/ALERT/DELIVERY。 */
    private String noticeType;

    private String noticeStatus;

    private Boolean alertFlag;

    /** 是否生成 OA 待办。 */
    private Boolean todoFlag;

    /** 接收时间（yyyy-MM-dd HH:mm:ss）。 */
    private String receivedTime;

    private String remark;
}
