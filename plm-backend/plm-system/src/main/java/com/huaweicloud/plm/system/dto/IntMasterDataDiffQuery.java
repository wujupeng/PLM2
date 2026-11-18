package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 主数据差异分页查询条件（N9，DEV-095）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntMasterDataDiffQuery extends PageQuery {

    /** 关联同步编号。 */
    private String syncNo;

    /** 主数据类型。 */
    private String masterType;

    /** 主数据编码。 */
    private String masterCode;

    /** 差异类型：VALUE_DIFF/MISSING_IN_TARGET/MISSING_IN_SOURCE。 */
    private String diffType;

    /** 处理状态：OPEN/RESOLVED/IGNORED。 */
    private String handleStatus;
}
