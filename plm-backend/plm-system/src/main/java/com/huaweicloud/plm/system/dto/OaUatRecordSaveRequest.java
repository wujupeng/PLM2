package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 用户验收（UAT）记录保存请求（OA-DEV-111）。
 */
@Data
public class OaUatRecordSaveRequest {

    /** 验收编号。 */
    private String uatNo;

    /** 验收部门。 */
    @NotBlank(message = "验收部门不能为空")
    private String dept;

    /** 验收场景名称。 */
    @NotBlank(message = "验收场景名称不能为空")
    private String sceneName;

    /** 关联场景编号。 */
    private String scenarioRef;

    /** 验收状态：PENDING/RUNNING/PASSED/FAILED。 */
    private String uatStatus;

    /** 责任部门。 */
    private String ownerDept;

    /** 参与人。 */
    private String participant;

    /** 预期结果。 */
    private String expected;

    /** 实际结果。 */
    private String actual;

    /** 问题数量。 */
    private Integer issueCount;

    /** 阻塞问题数量。 */
    private Integer blockerCount;

    /** 验收结论。 */
    private String conclusion;

    /** 验收时间（yyyy-MM-dd HH:mm:ss）。 */
    private String uatTime;

    /** 备注。 */
    private String remark;
}
