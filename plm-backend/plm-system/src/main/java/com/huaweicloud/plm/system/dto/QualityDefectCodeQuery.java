package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 缺陷代码库分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class QualityDefectCodeQuery extends PageQuery {

    /** 缺陷代码。 */
    private String defectCode;

    /** 缺陷分类。 */
    private String defectCategory;

    /** 工序编码。 */
    private String operationCode;

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 状态：0-停用 1-启用。 */
    private Integer status;
}
