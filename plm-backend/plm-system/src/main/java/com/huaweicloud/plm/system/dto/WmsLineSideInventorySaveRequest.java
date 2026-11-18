package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 线边仓库存保存请求。
 */
@Data
public class WmsLineSideInventorySaveRequest {

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 产线编码。 */
    private String lineCode;

    /** 线边库位编码。 */
    private String binCode;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库存数量。 */
    private BigDecimal qty;

    /** 可用数量。 */
    private BigDecimal availableQty;

    /** 冻结数量。 */
    private BigDecimal frozenQty;

    /** 最低库存数量。 */
    private BigDecimal minQty;

    /** 最高库存数量。 */
    private BigDecimal maxQty;

    /** 库存状态，为空默认 NORMAL。 */
    private String stockStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
