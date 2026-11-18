package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 统一码表分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CodeDictionaryQuery extends PageQuery {

    /** 字典类型，如 code_plant/code_year。 */
    private String dictType;

    /** 状态：1 启用 / 0 停用。 */
    private Integer status;
}
