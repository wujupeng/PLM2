package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 8D 报告分页查询条件（对应 8D 报告）。
 * keyword 匹配 eightdNo/supplierCode/supplierName/problemDesc/owner。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmEightDReportQuery extends PageQuery {

    /** 报告状态。 */
    private String eightdStatus;

    /** 供应商编码。 */
    private String supplierCode;

    /** 物料编码。 */
    private String materialCode;
}
