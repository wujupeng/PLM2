package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 构建部署记录分页查询条件（G1-N7 WBS T012）。
 * keyword 作用于运行编号/构建号/提交号/消息（模糊）；startDate/endDate 作用于开始时间。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DevopsBuildRunQuery extends PageQuery {

    /** 流水线编码。 */
    private String pipelineCode;

    /** 环境编码。 */
    private String envCode;

    /** 构建状态。 */
    private String buildStatus;

    /** 起始日期（yyyy-MM-dd），作用于开始时间。 */
    private String startDate;

    /** 结束日期（yyyy-MM-dd），作用于开始时间。 */
    private String endDate;
}
