package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 检验规范分页查询条件。
 * keyword 匹配 specNo/specName/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesInspectionSpecQuery extends PageQuery {

    /** 规范类型。 */
    private String specType;

    /** 规范状态。 */
    private String specStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 工序编码。 */
    private String processCode;
}
