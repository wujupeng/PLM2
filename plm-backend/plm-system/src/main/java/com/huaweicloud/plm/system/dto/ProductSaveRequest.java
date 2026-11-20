package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 产品型号保存请求。
 */
@Data
public class ProductSaveRequest {

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    @NotBlank(message = "产品名称不能为空")
    private String productName;

    private String seriesCode;

    private String seriesName;

    private String customerCode;

    private String model;

    @NotBlank(message = "产品计量单位不能为空")
    private String unit;

    /** 状态：draft/released/obsolete。 */
    private String status;

    private String description;

    private String remark;
}
