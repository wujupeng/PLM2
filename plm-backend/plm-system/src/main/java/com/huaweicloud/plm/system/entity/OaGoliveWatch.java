package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 上线值守与问题响应（OA-DEV-117）：值守班次、值守人员、监控范围、各业务量统计与问题闭环情况。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_golive_watch")
public class OaGoliveWatch extends BaseEntity {

    /** 值守编号。 */
    private String watchNo;

    /** 值守名称。 */
    private String watchName;

    /** 值守班次：FULL/DAY/NIGHT。 */
    private String watchShift;

    /** 值守角色：TECH/BIZ/OPS。 */
    private String dutyRole;

    /** 值守人员。 */
    private String dutyPerson;

    /** 监控范围。 */
    private String monitorScope;

    /** 登录量。 */
    private Integer loginCount;

    /** 流程量。 */
    private Integer flowCount;

    /** 邮件量。 */
    private Integer mailCount;

    /** 文档量。 */
    private Integer docCount;

    /** 接口调用量。 */
    private Integer apiCount;

    /** 问题总数。 */
    private Integer issueCount;

    /** 严重问题数。 */
    private Integer criticalIssueCount;

    /** 已闭环问题数。 */
    private Integer closedIssueCount;

    /** 值守状态：PENDING/CLOSED。 */
    private String watchStatus;

    /** 值守小结。 */
    private String reportSummary;

    /** 值守时间。 */
    private LocalDateTime watchTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
