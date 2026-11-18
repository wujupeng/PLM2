package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 来料检验单分页查询条件。
 * keyword 匹配 incomingNo/materialCode/materialName/supplierName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesIncomingInspectionQuery extends PageQuery {

    /** 检验状态。 */
    private String inspectionStatus;

    /** 检验结果。 */
    private String inspectionResult;

    /** 物料编码。 */
    private String materialCode;

    /** 供应商编码。 */
    private String supplierCode;
}
