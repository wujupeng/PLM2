package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 追溯码分页查询条件。
 * keyword 匹配 codeNo/codeContent/objectCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesTraceCodeQuery extends PageQuery {

    /** 码制。 */
    private String codeType;

    /** 追溯码状态。 */
    private String codeStatus;

    /** 对象类型。 */
    private String objectType;

    /** 对象编码。 */
    private String objectCode;
}
