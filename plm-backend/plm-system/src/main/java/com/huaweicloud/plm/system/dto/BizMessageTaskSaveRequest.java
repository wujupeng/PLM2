package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 消息总线与任务队列入参（OA-DEV-088）。
 */
@Data
public class BizMessageTaskSaveRequest {

    private String taskNo;

    /** 任务类型：EMAIL/NOTIFY/INDEX/SCAN/MIGRATION/SYNC。 */
    private String taskType;

    private String bizKey;

    private String idempotentKey;

    private String payload;

    private Integer priority;

    private Integer maxRetry;

    private String remark;
}
