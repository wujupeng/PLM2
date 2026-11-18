package com.huaweicloud.plm.system.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 数据质量扫描结果。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DataQualityScanResult {

    /** 本次执行的规则数量。 */
    private int scannedRules;

    /** 本次发现的问题数量。 */
    private int issueCount;
}
