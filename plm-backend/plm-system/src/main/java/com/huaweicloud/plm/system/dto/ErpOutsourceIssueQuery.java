package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 委外发料单分页查询条件（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）。
 * keyword 匹配 issueNo/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpOutsourceIssueQuery extends PageQuery {

    /** 发料单状态。 */
    private String issueStatus;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 加工商编码。 */
    private String supplierCode;
}
