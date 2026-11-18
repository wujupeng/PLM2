package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 协作任务：团队协同任务与进度跟踪。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_collab_task")
public class OaOaCollabTask extends BaseEntity {

    private String taskNo;

    private String title;

    private String content;

    private Long ownerUserId;

    private String ownerName;

    private Long orgId;

    private String participantJson;

    /** 优先级：LOW/NORMAL/HIGH/URGENT。 */
    private String priority;

    private LocalDateTime dueAt;

    private Integer progress;

    /** 任务状态：TODO/DOING/DONE/CANCELLED。 */
    private String taskStatus;

    private Long parentId;

    private String remark;
}
