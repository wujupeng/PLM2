package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 设备点检记录分页查询条件。
 * keyword 匹配 checkNo/equipmentCode/equipmentName/inspector。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesEquipmentCheckQuery extends PageQuery {

    /** 点检类型。 */
    private String checkType;

    /** 点检状态。 */
    private String checkStatus;

    /** 点检结果。 */
    private String checkResult;

    /** 设备编码。 */
    private String equipmentCode;
}
