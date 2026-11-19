package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

/** 迁移暂存行审核意见。 */
@Data
public class MigOpenBusinessReviewRequest {

    @NotNull(message = "审核结论不能为空")
    private Boolean approved;

    @Size(max = 1000, message = "审核意见不能超过1000个字符")
    private String comment;
}
