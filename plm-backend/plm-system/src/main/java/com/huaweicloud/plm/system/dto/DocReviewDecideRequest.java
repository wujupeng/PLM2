package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 图文档评审判定请求。
 */
@Data
public class DocReviewDecideRequest {

    @NotBlank(message = "判定结果不能为空")
    private String decision;

    /** 评审意见。 */
    private String comment;
}
