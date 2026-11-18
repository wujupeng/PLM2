package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 生产工单分页查询条件。
 * keyword 匹配 orderNo/erpOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesProdOrderQuery extends PageQuery {

    /** 工单状态。 */
    private String orderStatus;

    /** 优先级。 */
    private String priority;

    /** 物料编码。 */
    private String materialCode;

    /** 车间编码。 */
    private String workshopCode;
}
