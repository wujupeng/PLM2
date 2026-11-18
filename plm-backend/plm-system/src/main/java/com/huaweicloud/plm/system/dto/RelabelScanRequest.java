package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

/**
 * 扫描换标请求（N5，DEV-056/057/061）。
 */
@Data
public class RelabelScanRequest {

    /** 原标签编码。 */
    @NotBlank(message = "原标签编码不能为空")
    private String sourceCode;

    /** 原码类型，为空自动识别。 */
    private String codeType;

    /** 工厂编码。 */
    private String plantCode;

    /** 终端编号。 */
    private String terminalNo;

    /** 客户编码。 */
    private String customerCode;

    /** 项目编码。 */
    private String projectCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 数量。 */
    private Integer qty;

    /** 是否补打。 */
    private Boolean reprint;

    /** 补充字段集合（如 partNo8），优先于解析结果。 */
    private Map<String, String> fieldValues;

    private String remark;
}
