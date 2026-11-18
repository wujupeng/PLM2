package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 工作汇报：日报/周报/月报等汇报记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_oa_work_report")
public class OaOaWorkReport extends BaseEntity {

    private String reportNo;

    /** 汇报类型：DAILY/WEEKLY/MONTHLY。 */
    private String reportType;

    private String title;

    private String content;

    private Long reporterUserId;

    private String reporterName;

    private Long orgId;

    private String orgName;

    private LocalDate reportDate;

    private Long receiverUserId;

    private String receiverName;

    private String attachmentJson;

    /** 汇报状态：DRAFT/SUBMITTED/READ。 */
    private String reportStatus;

    private Integer readFlag;

    private LocalDateTime readAt;

    private String remark;
}
