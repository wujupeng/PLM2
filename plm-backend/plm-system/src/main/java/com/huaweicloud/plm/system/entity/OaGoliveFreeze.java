package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 冻结旧OA关键写入（OA-DEV-114）：冻结窗口、只读保留、应急预案与通知状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_golive_freeze")
public class OaGoliveFreeze extends BaseEntity {

    /** 冻结编号。 */
    private String freezeNo;

    /** 冻结名称。 */
    private String freezeName;

    /** 冻结类型：ALL/PARTIAL。 */
    private String freezeType;

    /** 冻结范围。 */
    private String freezeScope;

    /** 冻结开始时间。 */
    private LocalDateTime freezeStart;

    /** 冻结结束时间。 */
    private LocalDateTime freezeEnd;

    /** 是否只读保留：1 是，0 否。 */
    private Integer readOnlyRetained;

    /** 应急预案。 */
    private String emergencyPlan;

    /** 是否已发布通知：1 是，0 否。 */
    private Integer noticePublished;

    /** 通知时间。 */
    private LocalDateTime noticeTime;

    /** 冻结状态：PENDING/ACTIVE/RELEASED。 */
    private String freezeStatus;

    /** 值守负责人。 */
    private String dutyPerson;

    /** 操作人。 */
    private String operatorName;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
