package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 良率看板记录分页查询条件。
 * keyword 匹配 yieldNo/materialCode/materialName/lineCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesKanbanYieldQuery extends PageQuery {

    /** 记录状态。 */
    private String recordStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 产线编码。 */
    private String lineCode;

    /** 班次编码。 */
    private String shiftCode;
}
