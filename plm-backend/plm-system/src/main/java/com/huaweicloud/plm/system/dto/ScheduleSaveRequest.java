package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import lombok.Data;

/**
 * 日程保存入参。
 */
@Data
public class ScheduleSaveRequest {

    private String title;

    private String scheduleType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer allDayFlag;

    private String location;

    private String participantJson;

    private String shareScope;

    private Integer remindMinutes;

    private String content;

    private String remark;
}
