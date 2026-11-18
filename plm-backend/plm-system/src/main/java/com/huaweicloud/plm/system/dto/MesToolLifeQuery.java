package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 工装寿命分页查询条件。
 * keyword 匹配 toolNo/toolCode/toolName/toolType。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesToolLifeQuery extends PageQuery {

    /** 寿命状态。 */
    private String lifeStatus;

    /** 工装类型。 */
    private String toolType;

    /** 工装编码。 */
    private String toolCode;

    /** 设备编码。 */
    private String equipmentCode;
}
