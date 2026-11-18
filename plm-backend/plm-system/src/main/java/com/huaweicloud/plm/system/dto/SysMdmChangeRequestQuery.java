package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 主数据变更申请分页查询条件（G1-N8 主数据平台 T007 变更申请）。
 * keyword 匹配 changeNo/masterCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class SysMdmChangeRequestQuery extends PageQuery {

    /** 主数据域编码。 */
    private String domainCode;

    /** 变更类型。 */
    private String changeType;

    /** 申请状态。 */
    private String requestStatus;
}
