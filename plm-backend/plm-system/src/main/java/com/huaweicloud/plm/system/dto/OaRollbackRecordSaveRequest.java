package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 回退决策和演练保存请求（OA-DEV-118）。
 */
@Data
public class OaRollbackRecordSaveRequest {

    /** 回退编号。 */
    private String rollbackNo;

    /** 回退记录名称。 */
    @NotBlank(message = "回退记录名称不能为空")
    private String rollbackName;

    /** 回退类型：DECISION/EXECUTE。 */
    private String rollbackType;

    /** 回退原因。 */
    private String rollbackReason;

    /** 触发条件。 */
    private String triggerCondition;

    /** 回退范围。 */
    private String rollbackScope;

    /** 数据边界。 */
    private String dataBoundary;

    /** 决策结果：PENDING/GO/ROLLBACK。 */
    private String decisionResult;

    /** 决策时间（yyyy-MM-dd HH:mm:ss）。 */
    private String decisionTime;

    /** 演练结果：NOT_RUN/PASS/FAIL。 */
    private String drillResult;

    /** 演练时间（yyyy-MM-dd HH:mm:ss）。 */
    private String drillTime;

    /** 回退窗口时长（分钟）。 */
    private Integer windowMinutes;

    /** 是否避免双写：0否/1是。 */
    private Integer doubleWriteAvoided;

    /** 回退责任人。 */
    private String rollbackOwner;

    /** 备注。 */
    private String remark;
}
