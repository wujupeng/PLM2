package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_task_record")
public class OaTaskRecord extends BaseEntity {

    private Long instanceId;

    private Long taskId;

    private String nodeCode;

    private String nodeName;

    private Long operatorUserId;

    private String operatorName;

    /** 操作动作：SUBMIT/APPROVE/REJECT/CANCEL/TRANSFER/CC。 */
    private String action;

    /** 审批意见（数据库列名为 comment_text，避免 SQL 保留字冲突）。 */
    private String commentText;

    private LocalDateTime operatedAt;
}
