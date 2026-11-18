package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * 物料批量导入结果。
 */
@Data
public class MaterialImportResult {

    private String sourceFile;

    private int totalRows;

    private int successRows;

    private int failRows;

    private List<ImportRowError> errors;
}
