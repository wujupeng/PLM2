package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工程变更通知（ECN）（DEV-040）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("eco_notice")
public class EcoNotice extends BaseEntity {

    /** 所属变更单 ID。 */
    private Long ecoId;

    /** 所属变更单编号。 */
    private String ecoNo;

    /** 通知编号，规则 ECN-{yyyyMM}-{4 位流水号}。 */
    private String noticeNo;

    /** 通知标题。 */
    private String title;

    /** 通知内容。 */
    private String content;

    /** 通知对象类型：internal/supplier/customer。 */
    private String targetType;

    /** 通知对象编码。 */
    private String targetCode;

    /** 通知对象名称。 */
    private String targetName;

    /** 状态：draft/sent/confirmed。 */
    private String status;

    /** 发送时间。 */
    private LocalDateTime sentAt;

    /** 确认时间。 */
    private LocalDateTime confirmedAt;

    private String remark;
}
