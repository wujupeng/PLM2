package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 权威源登记分页查询条件（G1-N8 公共平台底座 T007 主数据平台）。
 * keyword 匹配 sourceNo/sourceEntity。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmSourceQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 源系统。 */
    private String sourceSystem;

    /** 权威级别。 */
    private String authorityLevel;

    /** 源状态。 */
    private String sourceStatus;
}
