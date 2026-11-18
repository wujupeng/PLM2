package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 字段映射分页查询条件。
 * keyword 匹配 mappingNo/mappingName/sourceField/targetField。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class IntgErpSrmMappingQuery extends PageQuery {

    /** 集成对象类型。 */
    private String objectType;

    /** 映射状态。 */
    private String mappingStatus;

    /** 所属接口编号。 */
    private String interfaceNo;
}
