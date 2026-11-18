package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 安全测试保存请求（OA-DEV-107）。
 */
@Data
public class OaSecurityTestSaveRequest {

    /** 扫描编码，新增为空时自动生成。 */
    private String scanNo;

    /** 检查项名称。 */
    @NotBlank(message = "检查项名称不能为空")
    private String checkName;

    /** 检查类型：CODE_SCAN/PENETRATION/VULNERABILITY。 */
    private String checkType;

    /** 风险级别：CRITICAL/HIGH/MEDIUM/LOW。 */
    private String severity;

    /** 检查目标。 */
    private String target;

    /** 使用的工具。 */
    private String toolName;

    /** 发现的问题。 */
    private String finding;

    /** 整改建议。 */
    private String suggestion;

    /** 整改状态：OPEN/FIXED/ACCEPTED。 */
    private String fixStatus;

    /** 是否接受风险：0/1。 */
    private Integer riskAccepted;

    /** 验证结果。 */
    private String verifyResult;

    /** 测试执行人。 */
    private String tester;

    /** 测试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String testTime;

    /** 备注。 */
    private String remark;
}
