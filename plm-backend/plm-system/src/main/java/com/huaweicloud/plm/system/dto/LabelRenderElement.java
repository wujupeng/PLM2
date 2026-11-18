package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 单个标签渲染元素。
 */
@Data
public class LabelRenderElement {

    /** 元素 key。 */
    private String key;

    /** 元素显示名称。 */
    private String label;

    /** 左上角横坐标。 */
    private BigDecimal x;

    /** 左上角纵坐标。 */
    private BigDecimal y;

    /** 元素宽度。 */
    private BigDecimal w;

    /** 元素高度。 */
    private BigDecimal h;

    /** 字号。 */
    private Integer fontSize;

    /** 对齐方式。 */
    private String align;

    /** 渲染后的值。 */
    private String value;
}
