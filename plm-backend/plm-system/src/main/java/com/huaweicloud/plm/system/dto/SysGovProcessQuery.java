package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 端到端流程分页查询条件（G1-N7 治理中心 T003 流程建模）。
 * keyword 匹配 processNo/processCode/processName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovProcessQuery extends PageQuery {

    /** 流程类型：O2C/P2P/P2M/R2S/D2M。 */
    private String processType;

    /** 流程层级：L1/L2/L3/...。 */
    private String processLevel;

    /** 流程状态。 */
    private String processStatus;
}
