package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 应急预案分页查询条件（N7，DEV-084）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsPlanQuery extends PageQuery {

    /** 预案类型：SUBSTITUTE/TRANSFER/EXPEDITE/RESCHEDULE/ESCALATE。 */
    private String planType;

    /** 状态：DRAFT/APPROVED/EXECUTING/COMPLETED/CANCELLED。 */
    private String planStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 关联欠料单号。 */
    private String caseNo;

    /** 供应商编码。 */
    private String supplierCode;
}
