package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备保养记录分页查询条件。
 * keyword 匹配 maintenanceNo/equipmentCode/equipmentName/maintainer。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesEquipmentMaintenanceQuery extends PageQuery {

    /** 保养类型。 */
    private String maintenanceType;

    /** 保养状态。 */
    private String maintenanceStatus;

    /** 设备编码。 */
    private String equipmentCode;

    /** 保养人。 */
    private String maintainer;
}
