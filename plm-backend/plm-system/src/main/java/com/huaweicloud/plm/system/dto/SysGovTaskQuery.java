package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 治理任务分页查询条件（G1-N7 治理中心 T001 项目治理）。
 * keyword 匹配 taskNo/taskName/assignee。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovTaskQuery extends PageQuery {

    /** 所属项目编码。 */
    private String projectCode;

    /** 任务状态。 */
    private String taskStatus;

    /** 任务优先级。 */
    private String taskPriority;
}
