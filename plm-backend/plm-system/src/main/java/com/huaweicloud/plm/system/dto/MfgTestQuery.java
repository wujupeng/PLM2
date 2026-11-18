package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 测试结果分页查询条件（N8，DEV-087）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MfgTestQuery extends PageQuery {

    /** 结果编号。 */
    private String resultNo;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 测试类型：ELECTRICAL/DIMENSION/ASSEMBLY/WELDING/POTTING/FUNCTION。 */
    private String testType;

    /** 结果：OK/NG。 */
    private String result;
}
