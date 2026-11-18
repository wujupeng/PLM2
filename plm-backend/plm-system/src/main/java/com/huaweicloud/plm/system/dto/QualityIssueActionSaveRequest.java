package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 质量问题措施记录保存请求。
 */
@Data
public class QualityIssueActionSaveRequest {

    @NotBlank(message = "措施类型不能为空")
    private String actionType;

    @NotBlank(message = "措施内容不能为空")
    private String content;

    /** 责任人 ID。 */
    private Long ownerId;

    /** 责任人姓名。 */
    private String ownerName;

    /** 计划完成日期。 */
    private LocalDate dueDate;
}
