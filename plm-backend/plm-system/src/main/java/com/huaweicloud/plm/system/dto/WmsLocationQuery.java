package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 库位分页查询条件（N7，DEV-075）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsLocationQuery extends PageQuery {

    /** 库位类型：RACK/STORAGE/STAGING/LINE_SIDE/RECEIVING。 */
    private String locationType;

    /** 关联产线（线边库位）。 */
    private String lineCode;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 状态：enabled/disabled。 */
    private String status;
}
