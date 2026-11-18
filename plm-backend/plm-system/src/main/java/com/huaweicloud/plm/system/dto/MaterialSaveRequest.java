package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 物料保存请求。
 */
@Data
public class MaterialSaveRequest {

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "物料名称不能为空")
    private String materialName;

    private Long categoryId;

    private String categoryCode;

    private String spec;

    /** 物料类型：part/raw/consumable。 */
    private String materialType;

    private String unit;

    /** 来源类型：make=自制，buy=外购。 */
    private String sourceType;

    private Long supplierId;

    private String supplierCode;

    /** 生命周期状态：draft/released/obsolete。 */
    private String lifecycleStatus;

    private BigDecimal stdCost;

    private LocalDate effectiveDate;

    private LocalDate obsoleteDate;

    private String remark;
}
