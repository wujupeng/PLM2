package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 导出任务分页查询条件（N9，DEV-099）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntExportTaskQuery extends PageQuery {

    /** 任务编号。 */
    private String taskNo;

    /** 导出范围：MASTER_DATA/BOM/TRACE/ATTACHMENT/ALL。 */
    private String scope;

    /** 导出格式：CSV/EXCEL/JSON。 */
    private String exportFormat;

    /** 任务状态：PENDING/RUNNING/SUCCESS/FAILED/CANCELLED。 */
    private String taskStatus;

    /** 申请人。 */
    private String requestedBy;
}
