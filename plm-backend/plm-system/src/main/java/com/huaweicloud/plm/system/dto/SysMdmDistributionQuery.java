package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据分发分页查询条件（G1-N8 公共平台底座 T007 主数据平台）。
 * keyword 匹配 distNo/masterCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmDistributionQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 目标系统。 */
    private String targetSystem;

    /** 分发状态。 */
    private String distStatus;

    /** 分发类型。 */
    private String distType;
}
