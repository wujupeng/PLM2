package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 质量与安全门禁（G1-N7 公共平台底座—DevSecOps WBS T012）：
 * 记录自动化测试、覆盖率、代码扫描、漏洞扫描与性能等门禁的阈值、结果、问题数与严重级别，
 * 未通过门禁的流水线不得进入下一环节。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_devops_gate")
public class SysDevopsGate extends BaseEntity {

    /** 门禁编号（唯一，支持人工指定）。 */
    private String gateNo;

    /** 流水线编码（必填）。 */
    private String pipelineCode;

    /** 运行编号。 */
    private String runNo;

    /** 门禁名称。 */
    private String gateName;

    /** 门禁类型：UNIT_TEST/COVERAGE/CODE_SCAN/VULN_SCAN/PERFORMANCE，默认 UNIT_TEST。 */
    private String gateType;

    /** 阈值表达式。 */
    private String thresholdExpr;

    /** 问题数，默认 0。 */
    private Integer issueCount;

    /** 严重级别。 */
    private String severity;

    /** 门禁结果：PASS/FAIL/WARN，默认 PASS。 */
    private String gateResult;

    /** 检查时间。 */
    private LocalDateTime checkTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
