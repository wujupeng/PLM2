package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/** 缺陷保存请求（N9，DEV-106）。 */
@Data
public class IntDefectSaveRequest {

    /** 缺陷编号（留空则自动生成）。 */
    private String defectNo;

    /** 缺陷来源。 */
    @NotBlank(message = "缺陷来源不能为空")
    private String source;

    /** 严重程度。 */
    private String severity;

    /** 缺陷标题。 */
    @NotBlank(message = "缺陷标题不能为空")
    private String title;

    /** 缺陷详情。 */
    private String detail;

    /** 所属模块。 */
    private String module;

    /** 发现时间。 */
    private LocalDateTime foundAt;

    /** SLA 响应时限（小时）。 */
    private Integer slaResponseHours;

    /** SLA 修复时限（小时）。 */
    private Integer slaFixHours;

    /** 处理人。 */
    private String assignee;

    /** 备注。 */
    private String remark;
}
