package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采集数据记录分页查询条件。
 * keyword 匹配 recordNo/deviceCode/pointCode/collectValue。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesCollectRecordQuery extends PageQuery {

    /** 校验状态。 */
    private String validateStatus;

    /** 数据质量标识。 */
    private String qualityFlag;

    /** 设备编码。 */
    private String deviceCode;

    /** 数据点编码。 */
    private String pointCode;
}
