package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 图文档审批操作日志（DEV-037）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("doc_approval_log")
public class DocApprovalLog extends BaseEntity {

    /** 所属图文档 ID。 */
    private Long documentId;

    /** 图文档编号。 */
    private String docNo;

    /** 版本号。 */
    private String versionNo;

    /** 操作动作：submit/approve/reject/release/obsolete/distribute/recall。 */
    private String action;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 操作意见。 */
    private String comment;
}
