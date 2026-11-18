package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 条码矩阵生成请求。
 */
@Data
public class BarcodeMatrixRequest {

    /** 条码内容。 */
    @NotBlank
    private String content;

    /** 条码类型：DATA_MATRIX / QR / CODE128，默认 DATA_MATRIX。 */
    private String barcodeType;

    /** 尺寸（像素），可选。 */
    private Integer sizePx;
}
