package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * BOM 单阶导入单行数据（DEV-025）。
 */
@Data
public class BomImportRow {

    private String sheetName;

    private Integer rowNumber;

    private String parentMaterialCode;

    private String childMaterialCode;

    private String childMaterialName;

    private BigDecimal qty;

    private String unit;

    private String itemSeq;

    /** 是否允许替代：0=否，1=是。 */
    private Integer substituteAllowed;

    private LocalDate validFrom;

    private LocalDate validTo;
}
