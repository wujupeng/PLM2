package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 包装与标签技术要求分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecPackagingQuery extends PageQuery {

    /** 包装规格编码。 */
    private String packagingCode;

    /** 产品编码。 */
    private String productCode;

    /** 客户编码。 */
    private String customerCode;

    /** 状态。 */
    private String status;
}
