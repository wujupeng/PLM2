package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追溯记录分页查询条件。
 * keyword 匹配 recordNo/objectCode/recorder/tracePath。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesTraceRecordQuery extends PageQuery {

    /** 对象类型。 */
    private String objectType;

    /** 追溯记录状态。 */
    private String recordStatus;

    /** 对象编码。 */
    private String objectCode;
}
