package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SupplierQuery extends PageQuery {

    /** 状态：1=启用，0=停用。 */
    private Integer status;
}
