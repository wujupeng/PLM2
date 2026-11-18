package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 货架保存请求（对应货架）。
 */
@Data
public class WmsRackSaveRequest {

    /** 货架编码（为空时自动生成）。 */
    @NotBlank(message = "货架编码不能为空")
    private String rackCode;

    /** 货架名称。 */
    private String rackName;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库区编码。 */
    private String zoneCode;

    /** 货架类型，为空默认 SHELF。 */
    private String rackType;

    /** 层数，为空默认 0。 */
    private Integer layerCount;

    /** 货位数，为空默认 0。 */
    private Integer binCount;

    /** 最大承重。 */
    private BigDecimal maxLoad;

    /** 条码。 */
    private String barcode;

    /** 货架状态，为空默认 DRAFT。 */
    private String rackStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
