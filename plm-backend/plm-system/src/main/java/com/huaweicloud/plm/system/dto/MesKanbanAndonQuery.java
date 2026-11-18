package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 异常安灯记录分页查询条件。
 * keyword 匹配 andonNo/lineCode/stationCode/triggerBy。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesKanbanAndonQuery extends PageQuery {

    /** 安灯类型。 */
    private String andonType;

    /** 安灯等级。 */
    private String andonLevel;

    /** 安灯状态。 */
    private String andonStatus;

    /** 产线编码。 */
    private String lineCode;
}
