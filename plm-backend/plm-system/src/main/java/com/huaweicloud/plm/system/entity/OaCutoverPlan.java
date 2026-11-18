package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 上线切换与回退预案（OA-DEV-113）：切换窗口、冻结时间、增量同步、入口切换、通知方案与回退预案。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_cutover_plan")
public class OaCutoverPlan extends BaseEntity {

    /** 预案编号。 */
    private String planNo;

    /** 预案名称。 */
    private String planName;

    /** 预案类型：CUTOVER/ROLLBACK。 */
    private String planType;

    /** 切换窗口。 */
    private String cutoverWindow;

    /** 冻结时间。 */
    private LocalDateTime freezeTime;

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

    /** 演练时间。 */
    private LocalDateTime rehearsalTime;

    /** 状态：DRAFT/REVIEWED/APPROVED。 */
    private String status;

    /** 批准人。 */
    private String approver;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
