package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 材料领用单分页查询条件（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 * keyword 匹配 issueNo/workshop。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpMaterialIssueQuery extends PageQuery {

    /** 领料状态。 */
    private String issueStatus;

    /** 生产订单号。 */
    private String orderNo;
}
