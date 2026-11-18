package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 拣料单分页查询条件。
 * keyword 匹配 pickNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsPickTaskQuery extends PageQuery {

    /** 拣料状态。 */
    private String pickStatus;

    /** 拣料类型。 */
    private String pickType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
