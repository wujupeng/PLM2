package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;

/**
 * 项目档案保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpProjectSaveRequest {

    /** 项目编号（为空时自动生成）。 */
    private String projectNo;

    /** 项目编码。 */
    private String projectCode;

    /** 项目名称。 */
    @NotBlank(message = "项目名称不能为空")
    private String projectName;

    /** 项目类型，为空默认 INTERNAL。 */
    private String projectType;

    /** 项目负责人。 */
    private String projectManager;

    /** 客户编码。 */
    private String customerCode;

    /** 开始日期。 */
    private LocalDateTime startDate;

    /** 结束日期。 */
    private LocalDateTime endDate;

    /** 预算金额，为空默认 0。 */
    private BigDecimal budgetAmount;

    /** 项目状态，为空默认 PLANNING。 */
    private String projectStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
