package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 编码解析请求（N5）。
 */
@Data
public class CodeParseRequest {

    /** 待解析编码。 */
    @NotBlank(message = "编码不能为空")
    private String code;

    /** 编码类型，为空时按长度自动识别。 */
    private String codeType;
}
