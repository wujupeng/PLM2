package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 生产退料单分页查询条件（对应生产退料单）。
 * keyword 匹配 returnNo/workOrderNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsReturnOrderQuery extends PageQuery {

    /** 退料状态。 */
    private String returnStatus;

    /** 退料类型。 */
    private String returnType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
