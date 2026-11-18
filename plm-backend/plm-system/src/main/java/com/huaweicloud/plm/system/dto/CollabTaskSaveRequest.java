package com.huaweicloud.plm.system.dto;

import java.time.LocalDateTime;
import lombok.Data;

/**
 * 协同任务保存入参。
 */
@Data
public class CollabTaskSaveRequest {

    private String title;

    private String content;

    private Long ownerUserId;

    private String participantJson;

    private String priority;

    private LocalDateTime dueAt;

    private Integer progress;

    private String taskStatus;

    private Long parentId;

    private String remark;
}
