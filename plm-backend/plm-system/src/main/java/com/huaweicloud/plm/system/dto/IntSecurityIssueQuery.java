package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 安全问题分页查询条件（N9，DEV-102）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntSecurityIssueQuery extends PageQuery {

    /** 问题编号。 */
    private String issueNo;

    /** 问题类别。 */
    private String category;

    /** 严重程度。 */
    private String severity;

    /** 状态。 */
    private String status;
}
