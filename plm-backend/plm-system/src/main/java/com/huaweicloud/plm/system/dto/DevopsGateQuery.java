package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 质量与安全门禁分页查询条件（G1-N7 WBS T012）。
 * keyword 作用于门禁编号/名称（模糊）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class DevopsGateQuery extends PageQuery {

    /** 流水线编码。 */
    private String pipelineCode;

    /** 运行编号。 */
    private String runNo;

    /** 门禁类型。 */
    private String gateType;

    /** 门禁结果：PASS/FAIL/WARN。 */
    private String gateResult;
}
