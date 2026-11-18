package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据域分页查询条件（G1-N8 公共平台底座 T007 主数据平台）。
 * keyword 匹配 domainNo/domainCode/domainName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmDomainQuery extends PageQuery {

    /** 主数据类型。 */
    private String masterType;

    /** 域状态。 */
    private String domainStatus;
}
