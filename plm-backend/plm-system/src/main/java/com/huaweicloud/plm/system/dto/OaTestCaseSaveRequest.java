package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 功能与回归测试用例保存请求（OA-DEV-105）。
 */
@Data
public class OaTestCaseSaveRequest {

    /** 用例编码，新增为空时自动生成。 */
    private String caseNo;

    /** 用例名称。 */
    @NotBlank(message = "用例名称不能为空")
    private String caseName;

    /** 所属功能模块。 */
    private String module;

    /** 关联需求编号。 */
    private String requirementRef;

    /** 关联页面。 */
    private String pageRef;

    /** 关联接口。 */
    private String apiRef;

    /** 关联数据表。 */
    private String tableRef;

    /** 用例类型：FUNCTION/REGRESSION。 */
    private String caseType;

    /** 优先级：P0/P1/P2。 */
    private String priority;

    /** 前置条件。 */
    private String precondition;

    /** 操作步骤。 */
    private String steps;

    /** 预期结果。 */
    private String expected;

    /** 执行状态：NOT_RUN/PASS/FAIL/BLOCKED。 */
    private String execStatus;

    /** 实际测试结果。 */
    private String testResult;

    /** 测试执行人。 */
    private String tester;

    /** 最近执行时间（yyyy-MM-dd HH:mm:ss）。 */
    private String lastRunTime;

    /** 状态：0/1。 */
    private Integer status;

    /** 备注。 */
    private String remark;
}
