package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 上线切换与回退预案保存请求（OA-DEV-113）。
 */
@Data
public class OaCutoverPlanSaveRequest {

    /** 预案编号。 */
    private String planNo;

    /** 预案名称。 */
    @NotBlank(message = "预案名称不能为空")
    private String planName;

    /** 预案类型：CUTOVER/ROLLBACK。 */
    private String planType;

    /** 切换窗口。 */
    private String cutoverWindow;

    /** 冻结时间（yyyy-MM-dd HH:mm:ss）。 */
    private String freezeTime;

    /** 增量同步方案。 */
    private String incrementSync;

    /** 入口切换方案。 */
    private String entrySwitch;

    /** 通知方案。 */
    private String notifyPlan;

    /** 值守负责人。 */
    private String dutyPerson;

    /** 回退触发条件。 */
    private String rollbackTrigger;

    /** 回退责任人。 */
    private String rollbackOwner;

    /** 演练结果：NOT_RUN/PASS/FAIL。 */
    private String rehearsalResult;

    /** 演练时间（yyyy-MM-dd HH:mm:ss）。 */
    private String rehearsalTime;

    /** 状态：DRAFT/REVIEWED/APPROVED。 */
    private String status;

    /** 批准人。 */
    private String approver;

    /** 备注。 */
    private String remark;
}
