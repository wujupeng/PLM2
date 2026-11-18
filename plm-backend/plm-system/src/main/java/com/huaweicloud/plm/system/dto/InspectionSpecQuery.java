package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 检验规范分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class InspectionSpecQuery extends PageQuery {

    /** 规范编码。 */
    private String specCode;

    /** 检验类型：iqc/ipqc/fqc/oqc。 */
    private String inspectionType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
