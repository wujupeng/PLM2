package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 消息总线与任务队列（OA-DEV-088）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_message_task")
public class OaMessageTask extends BaseEntity {

    /** 任务编号。 */
    private String taskNo;

    /** 任务类型：EMAIL/NOTIFY/INDEX/SCAN/MIGRATION/SYNC。 */
    private String taskType;

    /** 业务键。 */
    private String bizKey;

    /** 幂等键。 */
    private String idempotentKey;

    /** 载荷。 */
    private String payload;

    /** 任务状态：PENDING/RUNNING/SUCCESS/FAILED/DEAD。 */
    private String taskStatus;

    /** 优先级，值越小越优先。 */
    private Integer priority;

    /** 已尝试次数。 */
    private Integer attemptCount;

    /** 最大重试次数。 */
    private Integer maxRetry;

    /** 最近错误。 */
    private String lastError;

    /** 下次执行时间。 */
    private LocalDateTime nextExecuteTime;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 完成时间。 */
    private LocalDateTime finishTime;

    /** 是否死信：0/1。 */
    private Integer deadFlag;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
