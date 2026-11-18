package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 库位管理保存请求（对应库位）。
 */
@Data
public class WmsBinSaveRequest {

    /** 库位编码（为空时自动生成）。 */
    @NotBlank(message = "库位编码不能为空")
    private String binCode;

    /** 库位名称。 */
    private String binName;

    /** 所属仓库编码。 */
    private String warehouseCode;

    /** 所属库区编码。 */
    private String zoneCode;

    /** 库位类型，为空默认 STORAGE。 */
    private String binType;

    /** 容量上限。 */
    private BigDecimal maxCapacity;

    /** 已用容量。 */
    private BigDecimal usedCapacity;

    /** 容量单位。 */
    private String capacityUnit;

    /** 条码。 */
    private String barcode;

    /** 库位状态，为空默认 IDLE。 */
    private String binStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
