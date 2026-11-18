package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.util.Map;

/**
 * 标签打印请求。
 */
@Data
public class LabelPrintRequest {

    @NotBlank(message = "目标编码不能为空")
    private String targetCode;

    /** 模板编码。 */
    private String templateCode;

    /** 标签类型。 */
    private String labelType;

    /** 来源编码。 */
    private String sourceCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 打印数量，默认 1。 */
    private Integer qty;

    /** 打印机名称。 */
    private String printerName;

    /** 关联扫码日志 ID。 */
    private Long scanLogId;

    /** 字段值集合。 */
    private Map<String, String> fieldValues;

    private String remark;
}
