package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 召回关闭请求（N8，DEV-094）。
 */
@Data
public class MfgRecallCloseRequest {

    /** 关闭证据。 */
    @NotBlank(message = "关闭证据不能为空")
    private String closeEvidence;

    private String remark;
}
