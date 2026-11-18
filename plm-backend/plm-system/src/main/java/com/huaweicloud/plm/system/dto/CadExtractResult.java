package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * CAD 属性提取结果。
 */
@Data
public class CadExtractResult {

    /** CAD 文件 ID。 */
    private Long cadFileId;

    /** 提取状态：success/partial/failed。 */
    private String extractStatus;

    /** 命中结果，键为 PLM 字段名。 */
    private Map<String, String> matched;

    /** 异常说明列表。 */
    private List<String> errors;

    /** 汇总说明。 */
    private String message;
}
