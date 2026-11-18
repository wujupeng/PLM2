package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 欠料处理记录请求（N7，DEV-083）：责任人/措施/恢复/升级等过程留痕。
 */
@Data
public class WmsShortageCaseActionRequest {

    /** 处理动作类型：REGISTER/MEASURE/ESCALATE/RECOVER/CLOSE。 */
    @NotBlank(message = "处理动作类型不能为空")
    private String actionType;

    @NotBlank(message = "处理内容不能为空")
    private String content;

    /** 处理人（为空时取当前登录用户）。 */
    private String operatorName;

    private String remark;
}
