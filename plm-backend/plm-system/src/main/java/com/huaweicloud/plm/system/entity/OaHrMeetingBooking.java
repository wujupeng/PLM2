package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 会议室预约单：会议室预订记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_meeting_booking")
public class OaHrMeetingBooking extends BaseEntity {

    private String bookingNo;

    private Long roomId;

    private String roomName;

    private String subject;

    private Long organizerUserId;

    private String organizerName;

    private Long orgId;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String attendeeJson;

    private Integer attendeeCount;

    /** 预约状态：BOOKED/CANCELLED/FINISHED。 */
    private String bookingStatus;

    private Long instanceId;

    private String instanceNo;

    private String remark;
}
