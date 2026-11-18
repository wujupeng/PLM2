package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MES 设备状态记录分页查询条件。
 * keyword 匹配 statusNo/equipmentCode/equipmentName/operator。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesEquipmentStatusQuery extends PageQuery {

    /** 状态类型。 */
    private String statusType;

    /** 记录状态。 */
    private String recordStatus;

    /** 设备编码。 */
    private String equipmentCode;

    /** 操作人。 */
    private String operator;
}
