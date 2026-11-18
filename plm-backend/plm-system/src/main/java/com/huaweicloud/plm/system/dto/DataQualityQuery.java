package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 数据质量问题分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DataQualityQuery extends PageQuery {

    /** 处理状态：open/fixed/ignored。 */
    private String status;

    /** 严重程度：error/warning/info。 */
    private String severity;

    /** 规则编码。 */
    private String ruleCode;

    /** 实体类型。 */
    private String entityType;
}
