package com.huaweicloud.plm.system.dto;

import com.huaweicloud.plm.common.api.PageQuery;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * VMI 扫码收发分页查询条件。
 * keyword 匹配 scanNo/warehouseCode/binCode/materialCode/materialName。
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class WmsVmiScanQuery extends PageQuery {

    /** 扫码状态。 */
    private String scanStatus;

    /** 扫码类型。 */
    private String scanType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 物料编码。 */
    private String materialCode;
}
