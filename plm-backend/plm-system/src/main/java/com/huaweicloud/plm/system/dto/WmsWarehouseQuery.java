package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 仓库管理分页查询条件（对应仓库）。
 * keyword 匹配 warehouseCode/warehouseName/manager/address。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsWarehouseQuery extends PageQuery {

    /** 仓库类型。 */
    private String warehouseType;

    /** 仓库状态。 */
    private String warehouseStatus;
}
