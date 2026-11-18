package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 物料业务档案分页查询条件（G3-N1 ERP 基础资料 WBS T021）。
 * keyword 匹配 materialNo/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpMaterialQuery extends PageQuery {

    /** 物料状态。 */
    private String materialStatus;

    /** 物料组。 */
    private String materialGroup;
}
