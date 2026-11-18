package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * SOP作业指导书分页查询条件。
 * keyword 匹配 sopNo/sopName/processCode/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesSopQuery extends PageQuery {

    /** SOP状态。 */
    private String sopStatus;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** SOP版本。 */
    private String sopVersion;
}
