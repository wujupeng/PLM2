package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 迁移任务分页查询条件（N9，DEV-098）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntMigrationTaskQuery extends PageQuery {

    /** 任务编号。 */
    private String taskNo;

    /** 迁移范围：MATERIAL/BOM/SUPPLIER/PRODUCT/DOCUMENT/TRACE。 */
    private String scope;

    /** 来源系统。 */
    private String sourceSystem;

    /** 目标表名。 */
    private String targetTable;

    /** 任务状态：PENDING/RUNNING/SUCCESS/FAILED/PARTIAL。 */
    private String taskStatus;
}
