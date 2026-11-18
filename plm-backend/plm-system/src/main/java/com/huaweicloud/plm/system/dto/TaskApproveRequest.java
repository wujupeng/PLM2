package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TaskApproveRequest {

    /** 处理动作：APPROVE=同意，REJECT=驳回。 */
    @NotBlank(message = "处理动作不能为空")
    private String action;

    private String commentText;
}
