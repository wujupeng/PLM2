package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * VMI 超容量预警分页查询条件（G5-N8）。
 * keyword 匹配 warningNo/warehouseCode/binCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsVmiWarningQuery extends PageQuery {

    /** 预警状态。 */
    private String warningStatus;

    /** 预警等级。 */
    private String warningLevel;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 物料编码。 */
    private String materialCode;
}
