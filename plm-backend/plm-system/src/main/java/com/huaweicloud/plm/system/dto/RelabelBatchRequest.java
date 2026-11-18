package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 批量扫描换标请求（N5）。
 */
@Data
public class RelabelBatchRequest {

    /** 原标签编码清单。 */
    private List<String> sourceCodes;

    /** 原码类型。 */
    private String codeType;

    /** 工厂编码。 */
    private String plantCode;

    /** 终端编号。 */
    private String terminalNo;

    /** 补充字段集合。 */
    private Map<String, String> fieldValues;
}
