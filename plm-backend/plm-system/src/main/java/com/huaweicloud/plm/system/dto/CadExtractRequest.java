package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * CAD 属性提取请求，attributes 为空时视为未提供属性。
 */
@Data
public class CadExtractRequest {

    /** 待提取的 CAD 属性。 */
    private List<CadAttrValue> attributes;
}
