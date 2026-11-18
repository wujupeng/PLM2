package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 单据追溯分页查询条件（对应 WBS G3-N7a ERP 业务单据追踪）。
 * keyword 匹配 traceNo/docNo/docTitle/sourceDocNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpDocTrackQuery extends PageQuery {

    /** 单据类型。 */
    private String docType;

    /** 业务状态。 */
    private String bizStatus;

    /** 审批状态。 */
    private String approvalStatus;
}
