package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 货架分页查询条件（对应货架）。
 * keyword 匹配 rackCode/rackName/warehouseCode/zoneCode/barcode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsRackQuery extends PageQuery {

    /** 货架状态。 */
    private String rackStatus;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String zoneCode;
}
