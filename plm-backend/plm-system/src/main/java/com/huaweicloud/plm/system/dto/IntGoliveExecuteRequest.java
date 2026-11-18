package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 上线切换执行请求（N9，DEV-104）。 */
@Data
public class IntGoliveExecuteRequest {

    /** 切换状态。 */
    @NotBlank(message = "切换状态不能为空")
    private String cutoverStatus;

    /** 执行说明。 */
    private String note;
}
