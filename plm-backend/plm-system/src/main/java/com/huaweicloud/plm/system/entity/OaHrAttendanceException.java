package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 考勤异常处理单：考勤异常补卡/申诉申请，仅承载异常申请与处理结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_attendance_exception")
public class OaHrAttendanceException extends BaseEntity {

    private String exceptionNo;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    /** 异常类型：可配置字典，默认 OTHER。 */
    private String exceptionType;

    private LocalDate exceptionDate;

    private String exceptionDesc;

    private String applyReason;

    private String attachmentJson;

    private String handleResult;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
