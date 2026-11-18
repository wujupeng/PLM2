package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 安全问题保存请求（N9，DEV-102）。 */
@Data
public class IntSecurityIssueSaveRequest {

    /** 问题编号（留空则自动生成）。 */
    private String issueNo;

    /** 问题类别。 */
    @NotBlank(message = "问题类别不能为空")
    private String category;

    /** 严重程度。 */
    private String severity;

    /** 问题标题。 */
    @NotBlank(message = "问题标题不能为空")
    private String title;

    /** 问题详情。 */
    private String detail;

    /** 发现人。 */
    private String discoveredBy;

    /** 备注。 */
    private String remark;
}
