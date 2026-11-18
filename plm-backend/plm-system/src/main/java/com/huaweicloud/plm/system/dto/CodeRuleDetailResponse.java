package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.system.entity.CodeRule;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 编码规则明细返回组合。
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CodeRuleDetailResponse {

    /** 规则本体。 */
    private CodeRule rule;

    /** 分段明细列表。 */
    private List<CodeRuleSegmentResponse> segments;
}
