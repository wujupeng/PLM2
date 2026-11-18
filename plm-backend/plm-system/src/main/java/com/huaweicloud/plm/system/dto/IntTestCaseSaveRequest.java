package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 测试用例保存请求（N9，DEV-100）。 */
@Data
public class IntTestCaseSaveRequest {

    /** 用例编号，为空时自动生成。 */
    private String caseNo;

    /** 用例类型：FUNCTION/INTEGRATION/PERFORMANCE/SECURITY/UAT。 */
    @NotBlank(message = "用例类型不能为空")
    private String caseType;

    /** 关联节点（如 N9）。 */
    private String relatedNode;

    /** 用例标题。 */
    @NotBlank(message = "用例标题不能为空")
    private String title;

    /** 前置条件。 */
    private String precondition;

    /** 执行步骤。 */
    private String steps;

    /** 预期结果。 */
    private String expected;

    /** 优先级：P0/P1/P2，为空时默认 P1。 */
    private String priority;

    private String remark;
}
