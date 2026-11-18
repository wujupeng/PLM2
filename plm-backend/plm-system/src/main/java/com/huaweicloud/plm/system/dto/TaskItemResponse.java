package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 待办/已办任务视图：任务信息 + 所属流程实例摘要。
 */
@Data
public class TaskItemResponse {

    private Long taskId;

    private String taskNo;

    private Long instanceId;

    private String instanceNo;

    private String processName;

    private String title;

    private String applicantName;

    private String nodeCode;

    private String nodeName;

    private String taskStatus;

    private String action;

    private String commentText;

    private LocalDateTime dueAt;

    private LocalDateTime handledAt;

    private LocalDateTime createdAt;
}
