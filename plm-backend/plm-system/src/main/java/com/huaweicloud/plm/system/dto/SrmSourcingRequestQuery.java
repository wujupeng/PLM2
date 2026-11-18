package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 采购需求寻源分页查询条件（对应采购需求寻源）。
 * keyword 匹配 sourcingNo/sourcingTitle/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSourcingRequestQuery extends PageQuery {

    /** 寻源方式。 */
    private String sourcingType;

    /** 状态。 */
    private String sourcingStatus;

    /** 物料编码。 */
    private String materialCode;
}
