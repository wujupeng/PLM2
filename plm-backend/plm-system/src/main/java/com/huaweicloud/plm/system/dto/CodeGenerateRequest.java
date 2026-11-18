package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.Map;

/**
 * 编码生成请求（N5）。
 */
@Data
public class CodeGenerateRequest {

    /** 编码类型：CODE14/CODE24/CODE28，与 ruleCode 二选一。 */
    private String codeType;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 客户编码。 */
    private String customerCode;

    /** 项目编码。 */
    private String projectCode;

    /** 工厂编码。 */
    private String plantCode;

    /** 生成日期，为空取当天（用于自然日/闰年验证）。 */
    private LocalDate generateDate;

    /** 生成数量，默认 1，最大 500。 */
    private Integer qty;

    /** 分段取值集合，键为分段 field_key 或 seg_key。 */
    private Map<String, String> fieldValues;

    private String remark;
}
