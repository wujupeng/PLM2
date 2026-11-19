package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 暂存行分页查询条件。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MigOpenBusinessImportRowQuery extends PageQuery {

    private String rowStatus;
    private String objectType;
}
