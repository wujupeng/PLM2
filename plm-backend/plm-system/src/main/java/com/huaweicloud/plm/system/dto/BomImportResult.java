package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/**
 * BOM 单阶导入结果（DEV-025）。
 */
@Data
public class BomImportResult {

    private Long batchId;

    private String batchNo;

    private int totalRows;

    private int successRows;

    private int failRows;

    /** 批次状态：success/partial/failed。 */
    private String status;

    /** 失败行与警告明细。 */
    private List<BomImportRowError> errors;
}
