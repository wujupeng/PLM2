package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

/**
 * 标签渲染结果。
 */
@Data
public class LabelRenderResponse {

    /** 模板编码。 */
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 标签类型。 */
    private String labelType;

    /** 纸张宽度。 */
    private BigDecimal paperWidth;

    /** 纸张高度。 */
    private BigDecimal paperHeight;

    /** 尺寸单位。 */
    private String unit;

    /** 打印精度 DPI。 */
    private Integer dpi;

    /** 条码类型。 */
    private String barcodeType;

    /** 模块尺寸。 */
    private BigDecimal moduleSize;

    /** 条码内容。 */
    private String barcodeContent;

    /** 条码 Base64 图片，仅生成一次。 */
    private String barcodeBase64;

    /** 渲染元素列表。 */
    private List<LabelRenderElement> items;

    /** 提示信息。 */
    private List<String> warnings;
}
