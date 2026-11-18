package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** 主数据差异处理请求（N9，DEV-095）。 */
@Data
public class IntMasterDataDiffResolveRequest {

    @NotBlank(message = "处理状态不能为空")
    private String handleStatus;

    /** 处理说明。 */
    private String resolution;
}
