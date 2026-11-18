package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 质量问题单分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class QualityIssueQuery extends PageQuery {

    /** 问题单号。 */
    private String issueNo;

    /** 来源类型：internal/customer/supplier/inspection。 */
    private String sourceType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String operationCode;

    /** 缺陷代码。 */
    private String defectCode;

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 状态：open/analyzing/action/verifying/closed。 */
    private String status;
}
