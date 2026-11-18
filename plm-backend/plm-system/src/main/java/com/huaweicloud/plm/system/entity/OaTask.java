package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_task")
public class OaTask extends BaseEntity {

    private String taskNo;

    private Long instanceId;

    private String nodeCode;

    private String nodeName;

    private Long assigneeUserId;

    private String assigneeName;

    /** 任务状态：PENDING/APPROVED/REJECTED/TRANSFERRED/CANCELLED。 */
    private String taskStatus;

    /** 处理动作：SUBMIT/APPROVE/REJECT/CANCEL/TRANSFER/CC。 */
    private String action;

    /** 审批意见（数据库列名为 comment_text，避免 SQL 保留字冲突）。 */
    private String commentText;

    private LocalDateTime dueAt;

    private LocalDateTime handledAt;

    private String remark;
}
