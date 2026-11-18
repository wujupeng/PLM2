package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 线束端子分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecHarnessQuery extends PageQuery {

    /** 线束编码。 */
    private String harnessCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 状态。 */
    private String status;
}
