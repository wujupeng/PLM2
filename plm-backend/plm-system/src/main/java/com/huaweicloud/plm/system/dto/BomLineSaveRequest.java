package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * BOM 行保存请求。
 */
@Data
public class BomLineSaveRequest {

    /** 行号，为空时自动取当前最大行号 +1。 */
    private Integer lineNo;

    @NotBlank(message = "父件编码不能为空")
    private String parentMaterialCode;

    @NotBlank(message = "子件编码不能为空")
    private String childMaterialCode;

    private String childMaterialName;

    @NotNull(message = "用量不能为空")
    @DecimalMin(value = "0.0", message = "用量不能为负数")
    private BigDecimal qty;

    @NotBlank(message = "单位不能为空")
    private String unit;

    private String itemSeq;

    /** 是否允许替代：0=否，1=是。 */
    private Integer substituteAllowed;

    private LocalDate validFrom;

    private LocalDate validTo;

    private String remark;
}
