package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商门户账号分页查询条件（对应供应商门户账号）。
 * keyword 匹配 accountNo/supplierCode/supplierName/loginName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmPortalAccountQuery extends PageQuery {

    /** 门户角色。 */
    private String portalRole;

    /** 账号状态。 */
    private String accountStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
