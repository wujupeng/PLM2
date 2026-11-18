package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 标准工艺分页查询条件（对应 G3-N7b ERP 工艺资源）。
 * keyword 匹配 standardCode/standardName/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class ErpProcessStandardQuery extends PageQuery {

    /** 标准状态。 */
    private String standardStatus;

    /** 物料编码。 */
    private String materialCode;
}
