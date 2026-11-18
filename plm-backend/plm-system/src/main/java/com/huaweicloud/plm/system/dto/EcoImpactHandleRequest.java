package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 工程变更影响处理请求。
 */
@Data
public class EcoImpactHandleRequest {

    @NotBlank(message = "处理状态不能为空")
    private String handleStatus;

    /** 处理备注。 */
    private String handleRemark;
}
