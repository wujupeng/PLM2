package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 停机看板记录分页查询条件。
 * keyword 匹配 downtimeNo/equipmentCode/equipmentName/lineCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesKanbanDowntimeQuery extends PageQuery {

    /** 记录状态。 */
    private String recordStatus;

    /** 停机类型。 */
    private String downtimeType;

    /** 设备编码。 */
    private String equipmentCode;

    /** 产线编码。 */
    private String lineCode;
}
