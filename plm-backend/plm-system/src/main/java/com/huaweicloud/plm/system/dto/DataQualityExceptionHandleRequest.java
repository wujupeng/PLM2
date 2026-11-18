package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 数据异常处理请求（G1-N6 WBS T105 数据质量控制）：处理说明可选。
 */
@Data
public class DataQualityExceptionHandleRequest {

    /** 处理说明。 */
    private String handleNote;
}
