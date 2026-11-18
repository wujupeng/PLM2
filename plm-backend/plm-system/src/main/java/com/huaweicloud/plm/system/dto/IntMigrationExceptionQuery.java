package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 迁移异常分页查询条件（N9，DEV-098）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntMigrationExceptionQuery extends PageQuery {

    /** 关联任务编号。 */
    private String taskNo;

    /** 异常类型：FIELD_INVALID/DUPLICATE/MISSING_REF/FORMAT_ERROR。 */
    private String exceptionType;

    /** 处理状态：OPEN/RESOLVED/IGNORED。 */
    private String handleStatus;

    /** 源数据主键。 */
    private String sourceKey;
}
