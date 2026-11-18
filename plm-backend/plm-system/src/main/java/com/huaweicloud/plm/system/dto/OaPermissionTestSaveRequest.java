package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 角色与数据隔离测试保存请求（OA-DEV-106）。
 */
@Data
public class OaPermissionTestSaveRequest {

    /** 测试编码，新增为空时自动生成。 */
    private String testNo;

    /** 测试场景名称。 */
    @NotBlank(message = "测试场景名称不能为空")
    private String sceneName;

    /** 场景类型：CROSS_DEPT/CROSS_FACTORY。 */
    private String sceneType;

    /** 测试角色。 */
    private String roleName;

    /** 测试主体。 */
    private String subject;

    /** 数据范围。 */
    private String dataScope;

    /** 预期结果。 */
    private String expectedResult;

    /** 实际结果。 */
    private String actualResult;

    /** 数据隔离是否通过：0/1。 */
    private Integer isolationPass;

    /** 测试结论：PASS/FAIL/PENDING。 */
    private String result;

    /** 关联缺陷编号。 */
    private String defectNo;

    /** 测试执行人。 */
    private String tester;

    /** 测试时间（yyyy-MM-dd HH:mm:ss）。 */
    private String testTime;

    /** 备注。 */
    private String remark;
}
