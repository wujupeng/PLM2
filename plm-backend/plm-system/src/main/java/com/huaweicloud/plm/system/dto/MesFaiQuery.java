package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 首件确认分页查询条件。
 * keyword 匹配 faiNo/workOrderNo/processCode/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesFaiQuery extends PageQuery {

    /** 首件状态。 */
    private String faiStatus;

    /** 首件结果。 */
    private String faiResult;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;
}
