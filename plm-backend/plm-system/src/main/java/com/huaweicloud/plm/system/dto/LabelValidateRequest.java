package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 标签校验请求（G1-N6 WBS T106 移动端与PDA）。
 */
@Data
public class LabelValidateRequest {

    /** 条码。 */
    @NotBlank(message = "条码不能为空")
    private String barcode;

    /** 标签类型：MATERIAL/PRODUCT/BOX/WAREHOUSE。 */
    private String labelType;
}
