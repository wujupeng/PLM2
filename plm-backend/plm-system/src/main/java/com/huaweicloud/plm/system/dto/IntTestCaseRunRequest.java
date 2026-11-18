package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 测试用例执行请求（N9，DEV-100）。 */
@Data
public class IntTestCaseRunRequest {

    /** 执行状态：NOT_RUN/PASS/FAIL/BLOCKED。 */
    @NotBlank(message = "执行状态不能为空")
    private String runStatus;

    /** 执行结果说明。 */
    private String runResult;

    /** 关联缺陷编号。 */
    private String defectNo;
}
