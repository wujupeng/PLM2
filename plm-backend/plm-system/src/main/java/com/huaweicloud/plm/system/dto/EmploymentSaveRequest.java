package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EmploymentSaveRequest {

    @NotBlank(message = "工号不能为空")
    private String employeeNo;

    private Long userId;

    @NotBlank(message = "员工姓名不能为空")
    private String employeeName;

    private Long orgId;

    private Long positionId;

    private String positionName;

    private String employmentType;

    private String employmentStatus;

    private LocalDate hireDate;

    private LocalDate leaveDate;

    private Long managerUserId;

    private String workLocation;

    private String remark;
}
