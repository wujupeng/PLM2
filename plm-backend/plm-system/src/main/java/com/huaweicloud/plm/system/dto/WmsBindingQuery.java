package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 防混料绑定分页查询条件（N7，DEV-080）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsBindingQuery extends PageQuery {

    /** 绑定类型：LINE_MATERIAL/LINE_BATCH/STATION_CONTAINER。 */
    private String bindType;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 物料编码。 */
    private String materialCode;

    /** 状态：enabled/disabled。 */
    private String bindStatus;
}
