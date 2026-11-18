package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 定点定标分页查询条件（对应定点定标单）。
 * keyword 匹配 awardNo/rfqNo/supplierCode/supplierName/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmAwardQuery extends PageQuery {

    /** 定点类型。 */
    private String awardType;

    /** 状态。 */
    private String awardStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 物料编码。 */
    private String materialCode;
}
