package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.Map;

/**
 * 标签渲染请求。
 */
@Data
public class LabelRenderRequest {

    /** 模板编码，为空时按标签类型匹配已发布模板。 */
    private String templateCode;

    /** 标签类型。 */
    private String labelType;

    /** 条码内容。 */
    private String barcodeContent;

    /** 字段值集合，key 与模板元素 key 对应。 */
    private Map<String, String> fieldValues;

    /** 条码像素尺寸，非空时优先使用。 */
    private Integer sizePx;
}
