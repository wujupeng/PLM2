package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 欠料异常单关闭请求（N7，DEV-083）：必须填写关闭证据。
 */
@Data
public class WmsShortageCaseCloseRequest {

    @NotBlank(message = "关闭证据不能为空")
    private String closeEvidence;

    /** 关闭人（为空时取当前登录用户）。 */
    private String closedBy;

    private String remark;
}
