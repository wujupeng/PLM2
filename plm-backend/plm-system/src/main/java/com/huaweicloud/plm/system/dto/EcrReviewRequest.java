package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更申请（ECR）评审请求。
 */
@Data
public class EcrReviewRequest {

    @NotBlank(message = "评审结论不能为空")
    private String decision;

    /** 评审意见。 */
    private String comment;
}
