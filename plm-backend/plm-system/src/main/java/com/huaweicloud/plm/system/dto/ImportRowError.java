package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 批量导入单行错误。
 */
@Data
public class ImportRowError {

    private String sheetName;

    private Integer rowNumber;

    /** 出错字段名，整体行级错误时为 null。 */
    private String field;

    private String message;
}
