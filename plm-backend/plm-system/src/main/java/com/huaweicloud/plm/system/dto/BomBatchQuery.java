package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * BOM 导入批次分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class BomBatchQuery extends PageQuery {

    /** BOM 类型：EBOM/MBOM。 */
    private String bomType;

    /** 批次状态：pending/success/partial/failed。 */
    private String status;
}
