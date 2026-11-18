package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.BomIssue;
import lombok.Data;

import java.util.List;

/**
 * BOM 异常校验结果（DEV-029）。
 */
@Data
public class BomValidationResult {

    private Long headerId;

    private int issueCount;

    private List<BomIssue> issues;
}
