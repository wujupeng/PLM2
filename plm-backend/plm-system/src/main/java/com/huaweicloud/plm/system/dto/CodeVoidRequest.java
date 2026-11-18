package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 编码映射作废请求。
 */
@Data
public class CodeVoidRequest {

    /** 作废原因。 */
    private String reason;
}
