package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 技术规格实例分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SpecInstanceQuery extends PageQuery {

    /** 实例编码。 */
    private String instanceCode;

    /** 产品编码。 */
    private String productCode;

    /** 模板编码。 */
    private String templateCode;

    /** 状态：draft/released/obsolete。 */
    private String status;
}
