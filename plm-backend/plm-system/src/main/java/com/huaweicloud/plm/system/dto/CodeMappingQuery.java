package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 编码映射分页查询条件（N5）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class CodeMappingQuery extends PageQuery {

    /** 原标签编码。 */
    private String sourceCode;

    /** 追溯码。 */
    private String targetCode;

    /** 原码类型。 */
    private String sourceCodeType;

    /** 状态：active/void。 */
    private String status;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 工厂编码。 */
    private String plantCode;

    /** 起始日期（含）。 */
    private LocalDate dateFrom;

    /** 结束日期（含）。 */
    private LocalDate dateTo;
}
