package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 标签模板配置（N5）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("label_template")
public class LabelTemplate extends BaseEntity {

    /** 模板编码。 */
    private String templateCode;

    /** 模板名称。 */
    private String templateName;

    /** 模板版本，默认 V1。 */
    private String templateVersion;

    /** 标签类型：CODE14/CODE24/CODE28。 */
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

    /** 状态：draft/released/disabled。 */
    private String status;

    private String remark;
}
