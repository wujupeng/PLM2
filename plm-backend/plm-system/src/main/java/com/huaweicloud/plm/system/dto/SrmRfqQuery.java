package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 询价单分页查询条件（对应询价单）。
 * keyword 匹配 rfqNo/rfqTitle/materialCode/materialName/buyer。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmRfqQuery extends PageQuery {

    /** 询价方式。 */
    private String rfqType;

    /** 询价状态。 */
    private String rfqStatus;

    /** 关联寻源单号。 */
    private String sourcingNo;
}
