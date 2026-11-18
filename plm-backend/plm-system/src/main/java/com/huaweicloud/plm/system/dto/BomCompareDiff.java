package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * BOM 行比较差异明细。
 */
@Data
public class BomCompareDiff {

    /** 行键：父件 + 子件 + 位号。 */
    private String lineKey;

    /** 变化字段名。 */
    private String fieldName;

    private String valueA;

    private String valueB;
}
