package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * MES 工艺版本分页查询条件。
 * keyword 匹配 processVersionNo/processCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class MesProcessVersionQuery extends PageQuery {

    /** 版本状态。 */
    private String versionStatus;

    /** 工艺编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** 工艺路线编码。 */
    private String routeCode;
}
