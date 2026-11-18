package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 齐套检查分页查询条件。
 * keyword 匹配 checkNo/workOrderNo/productCode/productName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsKittingCheckQuery extends PageQuery {

    /** 齐套状态。 */
    private String kitStatus;

    /** 生产工单号。 */
    private String workOrderNo;
}
