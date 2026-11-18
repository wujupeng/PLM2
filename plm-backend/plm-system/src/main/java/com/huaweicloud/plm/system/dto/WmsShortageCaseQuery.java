package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 欠料异常单分页查询条件。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsShortageCaseQuery extends PageQuery {

    /** 物料编码。 */
    private String materialCode;

    /** 产线。 */
    private String lineCode;

    /** 关联缺料预警编号。 */
    private String warningNo;

    /** 责任人。 */
    private String owner;

    /** 状态：OPEN/PROCESSING/CLOSED。 */
    private String caseStatus;
}
