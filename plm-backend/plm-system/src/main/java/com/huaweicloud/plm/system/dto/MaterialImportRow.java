package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;

/**
 * 物料批量导入单行数据。
 */
@Data
public class MaterialImportRow {

    private String sheetName;

    private Integer rowNumber;

    private String materialCode;

    private String materialName;

    private String categoryCode;

    private String spec;

    private String materialType;

    private String unit;

    private String sourceType;

    private String supplierCode;

    private String lifecycleStatus;

    private BigDecimal stdCost;
}
