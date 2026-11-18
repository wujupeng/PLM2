package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import lombok.Data;

/**
 * 会议室预定保存入参。
 */
@Data
public class MeetingBookingSaveRequest {

    private Long roomId;

    private String subject;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private String attendeeJson;

    private Integer attendeeCount;

    private String remark;
}
