package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工作汇报分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WorkReportQuery extends PageQuery {

    private String reportType;

    private Long reporterUserId;

    private String startDate;

    private String endDate;
}
