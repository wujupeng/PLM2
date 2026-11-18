package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库位管理分页查询条件（对应库位）。
 * keyword 匹配 binCode/binName/warehouseCode/zoneCode/barcode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsBinQuery extends PageQuery {

    /** 库位类型。 */
    private String binType;

    /** 库位状态。 */
    private String binStatus;

    /** 所属仓库编码。 */
    private String warehouseCode;

    /** 所属库区编码。 */
    private String zoneCode;
}
