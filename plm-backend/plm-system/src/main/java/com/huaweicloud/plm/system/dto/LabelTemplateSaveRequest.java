package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 标签模板保存请求。
 */
@Data
public class LabelTemplateSaveRequest {

    @NotBlank(message = "模板编码不能为空")
    private String templateCode;

    @NotBlank(message = "模板名称不能为空")
    private String templateName;

    /** 模板版本，默认 V1。 */
    private String templateVersion;

    @NotBlank(message = "标签类型不能为空")
    private String labelType;

    /** 纸张宽度。 */
    private BigDecimal paperWidth;

    /** 纸张高度。 */
    private BigDecimal paperHeight;

    /** 尺寸单位，默认 mm。 */
    private String unit;

    /** 打印精度 DPI，默认 300。 */
    private Integer dpi;

    /** 条码类型，默认 DATA_MATRIX。 */
    private String barcodeType;

    /** DM 符号尺寸。 */
    private String dmSymbolSize;

    /** DM 纠错等级，默认 ECC200。 */
    private String dmEccLevel;

    /** 模块尺寸，默认 0.40。 */
    private BigDecimal moduleSize;

    /** 元素配置 JSON。 */
    private String elementJson;

    /** 布局配置 JSON。 */
    private String layoutJson;

    /** 状态，默认 draft。 */
    private String status;

    private String remark;
}
