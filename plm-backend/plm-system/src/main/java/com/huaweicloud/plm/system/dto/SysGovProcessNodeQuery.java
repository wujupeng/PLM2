package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 流程节点分页查询条件（G1-N7 治理中心 T003 流程建模）。
 * keyword 匹配 nodeNo/nodeCode/nodeName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovProcessNodeQuery extends PageQuery {

    /** 所属流程编码。 */
    private String processCode;

    /** 节点类型。 */
    private String nodeType;

    /** 节点状态。 */
    private String nodeStatus;
}
