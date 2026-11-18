package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 计量单位业务档案分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 uomNo/uomCode/uomName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpUomQuery extends PageQuery {

    /** 计量单位类型。 */
    private String uomType;

    /** 计量单位状态。 */
    private String uomStatus;
}
