package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.QualityIssue;
import com.huaweicloud.plm.system.entity.QualityIssueAction;
import lombok.Data;

import java.util.List;

/**
 * 质量问题详情：问题单本体与措施验证记录列表。
 */
@Data
public class QualityIssueDetailResponse {

    private QualityIssue issue;

    private List<QualityIssueAction> actions;
}
