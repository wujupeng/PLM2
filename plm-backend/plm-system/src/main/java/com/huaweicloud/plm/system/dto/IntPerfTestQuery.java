package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/** 性能测试分页查询条件（N9，DEV-101）。 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntPerfTestQuery extends PageQuery {

    /** 测试编号。 */
    private String testNo;

    /** 场景：BOM_EXPLODE/BATCH_IMPORT/SCAN_CONCURRENT/EDI_PEAK/TRACE_QUERY。 */
    private String scenario;

    /** 结果：PASS/FAIL。 */
    private String result;
}
