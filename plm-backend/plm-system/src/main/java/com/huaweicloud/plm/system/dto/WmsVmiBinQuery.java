package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * VMI 库位分页查询条件。
 * keyword 匹配 vmiBinNo/warehouseCode/binCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsVmiBinQuery extends PageQuery {

    /** 库位状态。 */
    private String binStatus;

    /** 库位类型。 */
    private String binType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 物料编码。 */
    private String materialCode;
}
