package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 图文档版本差异字段。
 */
@Data
public class DocVersionFieldDiff {

    /** 字段名。 */
    private String field;

    /** 字段显示名。 */
    private String fieldLabel;

    /** 左版本值。 */
    private String leftValue;

    /** 右版本值。 */
    private String rightValue;

    /** 是否发生变化。 */
    private Boolean changed;
}
