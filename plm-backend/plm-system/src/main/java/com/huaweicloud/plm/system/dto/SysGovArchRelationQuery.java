package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 架构关系分页查询条件（G1-N7 WBS T005 总体架构）。
 * keyword 匹配关系编号/源组件/目标组件/关系说明。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovArchRelationQuery extends PageQuery {

    /** 源组件。 */
    private String sourceComponent;

    /** 目标组件。 */
    private String targetComponent;

    /** 关系类型：CALL/DEPEND/...。 */
    private String relationType;

    /** 关系状态。 */
    private String relationStatus;
}
