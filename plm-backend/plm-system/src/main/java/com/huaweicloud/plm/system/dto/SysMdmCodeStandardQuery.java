package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 编码标准分页查询条件（G1-N8 公共平台底座 T007 主数据平台）。
 * keyword 匹配 standardNo/standardCode/standardName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmCodeStandardQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 重置周期。 */
    private String resetCycle;

    /** 标准状态。 */
    private String standardStatus;
}
