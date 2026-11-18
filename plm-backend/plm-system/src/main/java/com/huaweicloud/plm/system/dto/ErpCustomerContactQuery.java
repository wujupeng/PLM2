package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户联系人分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 contactNo/contactName/customerCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpCustomerContactQuery extends PageQuery {

    /** 联系人状态。 */
    private String contactStatus;
}
