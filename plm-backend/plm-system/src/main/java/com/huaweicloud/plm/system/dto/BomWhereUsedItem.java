package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 物料被引用的 BOM 行（DEV-031 反查/where-used）。
 */
@Data
public class BomWhereUsedItem {

    private Long headerId;

    private String bomCode;

    private String productCode;

    private String bomType;

    private String versionNo;

    private String status;

    private String parentMaterialCode;

    private Integer lineNo;

    private BigDecimal qty;
}
