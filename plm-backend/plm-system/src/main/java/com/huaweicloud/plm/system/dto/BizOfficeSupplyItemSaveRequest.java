package com.huaweicloud.plm.system.dto;

import java.math.BigDecimal;
import lombok.Data;

/**
 * 办公用品物料保存入参（OA-DEV-081）。
 */
@Data
public class BizOfficeSupplyItemSaveRequest {

    private String itemCode;

    private String itemName;

    private String category;

    private String specification;

    private String unit;

    private BigDecimal unitPrice;

    private BigDecimal stockQty;

    private BigDecimal safetyStock;

    /** 是否需要库存管理。 */
    private Boolean needStock;

    private Integer status;

    private String remark;
}
