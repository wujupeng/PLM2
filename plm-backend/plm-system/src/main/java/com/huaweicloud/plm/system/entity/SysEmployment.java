package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_employment")
public class SysEmployment extends BaseEntity {

    private String employeeNo;

    private Long userId;

    private String employeeName;

    private Long orgId;

    private Long positionId;

    private String positionName;

    /** 用工性质：FULL_TIME/PART_TIME/INTERN/OUTSOURCE/DISPATCH。 */
    private String employmentType;

    /** 在职状态：ACTIVE/PROBATION/SUSPENDED/RESIGNED/RETIRED。 */
    private String employmentStatus;

    private LocalDate hireDate;

    private LocalDate leaveDate;

    /** 直属上级用户 ID。 */
    private Long managerUserId;

    private String workLocation;

    private String remark;
}
