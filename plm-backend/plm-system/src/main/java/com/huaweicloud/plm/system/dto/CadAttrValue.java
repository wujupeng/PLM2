package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * CAD 属性键值对。
 */
@Data
public class CadAttrValue {

    /** 属性名。 */
    private String name;

    /** 属性值。 */
    private String value;
}
