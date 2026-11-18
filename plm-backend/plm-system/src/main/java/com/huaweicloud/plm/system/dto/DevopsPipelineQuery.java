package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流水线分页查询条件（G1-N7 WBS T012）。
 * keyword 作用于流水线编号/编码/名称（模糊）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DevopsPipelineQuery extends PageQuery {

    /** 关联仓库编码。 */
    private String repoCode;

    /** 触发方式：PUSH/MANUAL/SCHEDULE。 */
    private String triggerType;

    /** 流水线状态。 */
    private String pipelineStatus;
}
