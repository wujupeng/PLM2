package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据质量校验分页查询条件（G1-N8 主数据平台 T007 质量校验）。
 * keyword 匹配 checkNo/masterCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmQualityCheckQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 校验结果。 */
    private String checkResult;

    /** 校验项。 */
    private String checkItem;
}
