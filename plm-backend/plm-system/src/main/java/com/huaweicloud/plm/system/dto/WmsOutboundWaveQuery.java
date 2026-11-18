package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 出库波次单分页查询条件。
 * keyword 匹配 waveNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsOutboundWaveQuery extends PageQuery {

    /** 波次状态。 */
    private String waveStatus;

    /** 波次类型。 */
    private String waveType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
