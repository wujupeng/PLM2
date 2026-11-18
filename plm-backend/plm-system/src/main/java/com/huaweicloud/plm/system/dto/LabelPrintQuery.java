package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 标签打印任务分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class LabelPrintQuery extends PageQuery {

    /** 任务编号。 */
    private String taskNo;

    /** 目标编码。 */
    private String targetCode;

    /** 来源编码。 */
    private String sourceCode;

    /** 产品编码。 */
    private String productCode;

    /** 模板编码。 */
    private String templateCode;

    /** 打印状态。 */
    private String printStatus;

    /** 是否补打：0-否，1-是。 */
    private Integer reprintFlag;

    /** 打印起始日期。 */
    private LocalDate dateFrom;

    /** 打印截止日期。 */
    private LocalDate dateTo;
}
