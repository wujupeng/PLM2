package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 会计科目分页查询条件（对应 WBS T028 会计科目与会计期间，属 G3-N6 ERP 财务）。
 * keyword 匹配 accountCode/accountName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpFinanceAccountQuery extends PageQuery {

    /** 科目类型。 */
    private String accountType;

    /** 科目状态。 */
    private String accountStatus;

    /** 上级科目编码。 */
    private String parentCode;
}
