package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追踪链接分页查询条件（G1-N7 WBS T004 需求追踪）。
 * keyword 匹配链接编号/目标引用/目标名称。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysGovTraceLinkQuery extends PageQuery {

    /** 关联需求编码。 */
    private String reqCode;

    /** 链接类型：FUNCTION/DATA/API/TEST/EVIDENCE 等。 */
    private String linkType;

    /** 链接状态。 */
    private String linkStatus;
}
