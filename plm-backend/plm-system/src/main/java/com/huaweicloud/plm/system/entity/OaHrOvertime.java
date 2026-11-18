package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 加班单：员工加班申请，审批由 OA-N3 工作流引擎承载。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_hr_overtime")
public class OaHrOvertime extends BaseEntity {

    private String overtimeNo;

    private Long applicantUserId;

    private String applicantName;

    private Long orgId;

    private String orgName;

    /** 加班类型：可配置字典，默认 WORKDAY。 */
    private String overtimeType;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private BigDecimal overtimeHours;

    /** 补偿方式：可配置字典，默认 COMPENSATORY。 */
    private String compensateType;

    private String reason;

    private String attachmentJson;

    /** 流程状态：DRAFT/RUNNING/APPROVED/REJECTED/CANCELLED。 */
    private String flowStatus;

    private Long instanceId;

    private String instanceNo;

    private Integer cancelFlag;

    private String remark;
}
