package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备故障记录分页查询条件。
 * keyword 匹配 faultNo/equipmentCode/equipmentName/faultType。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesEquipmentFaultQuery extends PageQuery {

    /** 故障等级。 */
    private String faultLevel;

    /** 故障状态。 */
    private String faultStatus;

    /** 故障类型。 */
    private String faultType;

    /** 设备编码。 */
    private String equipmentCode;
}
