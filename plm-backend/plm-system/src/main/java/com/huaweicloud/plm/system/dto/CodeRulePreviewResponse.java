package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 编码规则预览结果。
 */
@Data
public class CodeRulePreviewResponse {

    /** 编码总长度。 */
    private int totalLength;

    /** 分段定义是否通过校验。 */
    private boolean valid;

    /** 校验说明。 */
    private String message;

    /** 分段描述列表，形如 "1-2 备用位（前） 固定值 00"。 */
    private List<String> segmentDescriptions;
}
