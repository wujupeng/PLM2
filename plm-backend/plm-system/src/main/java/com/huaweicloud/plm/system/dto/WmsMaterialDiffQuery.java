package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 退补料差异处理单分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsMaterialDiffQuery extends PageQuery {

    /** 差异状态。 */
    private String diffStatus;

    /** 差异类型。 */
    private String diffType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;
}
