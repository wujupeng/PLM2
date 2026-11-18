package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 盘点发现分页查询条件（G1-N7 治理中心 T002 现状盘点）。
 * keyword 匹配 findingNo/findingTitle。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovAsisFindingQuery extends PageQuery {

    /** 关联存量系统编码。 */
    private String systemCode;

    /** 发现类型。 */
    private String findingType;

    /** 发现状态。 */
    private String findingStatus;
}
