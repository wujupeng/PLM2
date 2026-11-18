package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 供应商考评分页查询条件（对应供应商考评）。
 * keyword 匹配 assessmentNo/supplierCode/supplierName/assessmentPeriod/assessor。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SrmSupplierAssessmentQuery extends PageQuery {

    /** 考评类型。 */
    private String assessmentType;

    /** 考评状态。 */
    private String assessmentStatus;

    /** 供应商编码。 */
    private String supplierCode;
}
