package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 计量单位换算分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 conversionNo/fromUom/toUom/materialCode。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpUomConversionQuery extends PageQuery {

    /** 换算状态。 */
    private String conversionStatus;
}
