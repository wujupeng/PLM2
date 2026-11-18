package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 治理项目保存请求（G1-N7 治理中心 T001 项目治理）。
 */
@Data
public class SysGovProjectSaveRequest {

    /** 项目编号（为空时自动生成）。 */
    private String projectNo;

    /** 项目编码。 */
    private String projectCode;

    /** 项目名称。 */
    @NotBlank(message = "项目名称不能为空")
    private String projectName;

    /** 项目类型，为空默认 PLATFORM。 */
    private String projectType;

    /** 项目发起人。 */
    private String sponsor;

    /** 项目经理。 */
    private String managerName;

    /** 计划开始时间。 */
    private LocalDateTime startDate;

    /** 计划结束时间。 */
    private LocalDateTime endDate;

    /** 项目状态，为空默认 PLANNING。 */
    private String projectStatus;

    /** 项目范围说明。 */
    private String scopeDesc;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
