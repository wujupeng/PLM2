package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 测试用例分页查询条件（N9，DEV-100）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntTestCaseQuery extends PageQuery {

    /** 用例编号。 */
    private String caseNo;

    /** 用例类型：FUNCTION/INTEGRATION/PERFORMANCE/SECURITY/UAT。 */
    private String caseType;

    /** 关联节点（如 N9）。 */
    private String relatedNode;

    /** 优先级：P0/P1/P2。 */
    private String priority;

    /** 执行状态：NOT_RUN/PASS/FAIL/BLOCKED。 */
    private String runStatus;
}
