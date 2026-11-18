package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备台账分页查询条件。
 * keyword 匹配 equipmentNo/equipmentName/equipmentType/model/workshopCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesEquipmentQuery extends PageQuery {

    /** 设备状态。 */
    private String equipmentStatus;

    /** 设备类型。 */
    private String equipmentType;

    /** 车间编码。 */
    private String workshopCode;

    /** 产线编码。 */
    private String lineCode;
}
