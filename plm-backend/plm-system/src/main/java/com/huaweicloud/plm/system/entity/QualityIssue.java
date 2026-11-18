package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 质量问题单（DEV-049 / DEV-050）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("quality_issue")
public class QualityIssue extends BaseEntity {

    /** 问题单号，规则 QI-{yyyyMM}-{4 位流水号}。 */
    private String issueNo;

    /** 问题标题。 */
    private String title;

    /** 来源类型：internal/customer/supplier/inspection。 */
    private String sourceType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String operationCode;

    /** 缺陷代码。 */
    private String defectCode;

    /** 缺陷名称。 */
    private String defectName;

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 不良数量。 */
    private BigDecimal foundQty;

    /** 问题描述。 */
    private String issueDesc;

    /** 责任部门。 */
    private String responsibleDept;

    /** 责任人 ID。 */
    private Long responsibleId;

    /** 责任人姓名。 */
    private String responsibleName;

    /** 临时措施。 */
    private String tempAction;

    /** 根因分析。 */
    private String rootCause;

    /** 永久措施。 */
    private String permanentAction;

    /** 验证结果。 */
    private String verifyResult;

    /** 状态：open/analyzing/action/verifying/closed。 */
    private String status;

    /** 发现时间。 */
    private LocalDateTime foundAt;

    /** 关闭时间。 */
    private LocalDateTime closedAt;

    /** 关联的工程变更申请 ID。 */
    private Long ecrId;

    /** 关联的工程变更申请编号。 */
    private String ecrNo;

    private String remark;
}
