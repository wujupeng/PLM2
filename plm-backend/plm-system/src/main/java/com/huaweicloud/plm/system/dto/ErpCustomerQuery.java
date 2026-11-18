package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户业务档案分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 customerNo/customerCode/customerName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpCustomerQuery extends PageQuery {

    /** 客户类型。 */
    private String customerType;

    /** 客户状态。 */
    private String customerStatus;
}
