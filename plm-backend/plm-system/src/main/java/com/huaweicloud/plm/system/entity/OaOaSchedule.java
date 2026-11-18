package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 个人/部门日程：日程安排与参与人信息。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_schedule")
public class OaOaSchedule extends BaseEntity {

    private String scheduleNo;

    private Long ownerUserId;

    private String ownerName;

    private Long orgId;

    private String title;

    /** 日程类型：PERSONAL/DEPARTMENT/COMPANY。 */
    private String scheduleType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer allDayFlag;

    private String location;

    private String participantJson;

    /** 共享范围：PRIVATE/PARTICIPANT/DEPARTMENT/PUBLIC。 */
    private String shareScope;

    private Integer remindMinutes;

    private String content;

    /** 日程状态：ACTIVE/CANCELLED/FINISHED。 */
    private String scheduleStatus;

    private String remark;
}
