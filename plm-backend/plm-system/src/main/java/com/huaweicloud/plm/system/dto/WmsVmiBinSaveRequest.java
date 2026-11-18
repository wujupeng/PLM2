package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * VMI 库位保存请求。
 */
@Data
public class WmsVmiBinSaveRequest {

    /** VMI 库位单号（为空时自动生成）。 */
    private String vmiBinNo;

    /** 库位类型，为空默认 STORAGE。 */
    private String binType;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 库位容量。 */
    private BigDecimal capacityQty;

    /** 托盘数。 */
    private BigDecimal palletQty;

    /** 最大托盘数。 */
    private BigDecimal maxPalletQty;

    /** 二维码。 */
    private String qrCode;

    /** 库位状态，为空默认 IDLE。 */
    private String binStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
