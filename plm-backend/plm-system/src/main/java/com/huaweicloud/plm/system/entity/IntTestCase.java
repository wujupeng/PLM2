package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 测试用例（N9，DEV-100）：功能、集成、性能、安全与 UAT 用例及执行结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("int_test_case")
public class IntTestCase extends BaseEntity {

    /** 用例编号（唯一）。 */
    private String caseNo;

    /** 用例类型：FUNCTION/INTEGRATION/PERFORMANCE/SECURITY/UAT。 */
    private String caseType;

    /** 关联节点（如 N9）。 */
    private String relatedNode;

    /** 用例标题。 */
    private String title;

    /** 前置条件。 */
    private String precondition;

    /** 执行步骤。 */
    private String steps;

    /** 预期结果。 */
    private String expected;

    /** 优先级：P0/P1/P2。 */
    private String priority;

    /** 执行状态：NOT_RUN/PASS/FAIL/BLOCKED。 */
    private String runStatus;

    /** 执行结果说明。 */
    private String runResult;

    /** 执行时间。 */
    private LocalDateTime runAt;

    /** 执行人。 */
    private String runner;

    /** 关联缺陷编号。 */
    private String defectNo;

    private String remark;
}
