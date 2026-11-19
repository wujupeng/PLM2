package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.util.List;

/** 批量暂存结果摘要。 */
@Data
public class MigOpenBusinessImportResult {

    private Long batchId;
    private String batchNo;
    private int totalCount;
    private int validCount;
    private int invalidCount;
    private List<RowResult> rows;

    @Data
    public static class RowResult {
        private String sourceNo;
        private String objectType;
        private String rowStatus;
        private String validationMessage;
    }
}
