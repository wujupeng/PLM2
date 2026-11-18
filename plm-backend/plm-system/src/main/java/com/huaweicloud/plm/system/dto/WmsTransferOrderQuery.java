package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 调拨单分页查询条件。
 * keyword 匹配 transferNo/fromWarehouseCode/toWarehouseCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsTransferOrderQuery extends PageQuery {

    /** 调拨状态。 */
    private String transferStatus;

    /** 调拨类型。 */
    private String transferType;

    /** 调出仓库编码。 */
    private String fromWarehouseCode;

    /** 物料编码。 */
    private String materialCode;
}
