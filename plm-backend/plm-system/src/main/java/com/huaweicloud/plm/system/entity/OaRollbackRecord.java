package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 回退决策和演练（OA-DEV-118）：回退类型、触发条件、回退范围、数据边界、决策与演练结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_rollback_record")
public class OaRollbackRecord extends BaseEntity {

    /** 回退编号。 */
    private String rollbackNo;

    /** 回退记录名称。 */
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

    /** 决策时间。 */
    private LocalDateTime decisionTime;

    /** 演练结果：NOT_RUN/PASS/FAIL。 */
    private String drillResult;

    /** 演练时间。 */
    private LocalDateTime drillTime;

    /** 回退窗口时长（分钟）。 */
    private Integer windowMinutes;

    /** 是否避免双写：0否/1是。 */
    private Integer doubleWriteAvoided;

    /** 回退责任人。 */
    private String rollbackOwner;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
