package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 序列号分页查询条件（对应序列号）。
 * keyword 匹配 serialNo/materialCode/materialName/batchNo。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsSerialNumberQuery extends PageQuery {

    /** 序列号状态。 */
    private String serialStatus;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;
}
