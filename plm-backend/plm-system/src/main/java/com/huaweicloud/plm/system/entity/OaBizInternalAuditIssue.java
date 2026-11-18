package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 内部审核不符合项（OA-DEV-074）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_biz_internal_audit_issue")
public class OaBizInternalAuditIssue extends BaseEntity {

    /** 所属审核单 ID。 */
    private Long auditId;

    private String issueNo;

    private String issueDesc;

    private String issueLevel;

    private Long responsibleUserId;

    private String responsibleName;

    private LocalDate dueDate;

    private String correctAction;

    private String verifyResult;

    /** 不符合项状态：OPEN/CLOSED 等。 */
    private String issueStatus;

    private LocalDateTime closeTime;

    private Integer sortNo;

    private String remark;
}
