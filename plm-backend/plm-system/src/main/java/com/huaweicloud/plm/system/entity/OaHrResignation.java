package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 离职申请单：员工离职及工作交接申请，审批由 OA-N3 工作流引擎承载。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_resignation")
public class OaHrResignation extends BaseEntity {

    private String resignationNo;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    private String positionName;

    private LocalDate lastWorkDate;

    /** 离职类型：可配置字典，默认 VOLUNTARY。 */
    private String resignationType;

    private String reason;

    private String handoverJson;

    private Long handoverUserId;

    private String handoverUserName;

    private Integer accountDisableFlag;

    private Integer accountDisabled;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
