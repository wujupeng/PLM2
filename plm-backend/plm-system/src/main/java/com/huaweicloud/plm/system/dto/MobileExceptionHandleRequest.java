package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 移动异常处理请求（G1-N6 WBS T106 移动端与PDA）：处理说明可选。
 */
@Data
public class MobileExceptionHandleRequest {

    /** 处理说明。 */
    private String handleNote;
}
