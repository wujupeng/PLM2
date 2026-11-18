package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 图文档评审任务（DEV-037）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_review_task")
public class DocReviewTask extends BaseEntity {

    /** 所属图文档 ID。 */
    private Long documentId;

    /** 图文档编号。 */
    private String docNo;

    /** 版本号。 */
    private String versionNo;

    /** 节点编码。 */
    private String nodeCode;

    /** 节点名称。 */
    private String nodeName;

    /** 序号，从 1 递增。 */
    private Integer seqNo;

    /** 分配人 ID。 */
    private Long assigneeId;

    /** 分配人名称。 */
    private String assigneeName;

    /** 判定结果：pending/approved/rejected。 */
    private String decision;

    /** 评审意见。 */
    private String comment;

    /** 判定时间。 */
    private LocalDateTime decidedAt;
}
