package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * BOM 导入单行错误/警告。
 */
@Data
public class BomImportRowError {

    private String sheetName;

    private Integer rowNumber;

    /** 出错字段名。 */
    private String field;

    private String message;
}
