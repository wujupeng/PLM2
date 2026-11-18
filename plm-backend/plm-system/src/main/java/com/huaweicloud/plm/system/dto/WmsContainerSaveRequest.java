package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 容器管理保存请求（对应容器管理）。
 */
@Data
public class WmsContainerSaveRequest {

    /** 容器编码（为空时自动生成）。 */
    @NotBlank(message = "容器编码不能为空")
    private String containerCode;

    /** 容器名称。 */
    private String containerName;

    /** 容器类型，为空默认 PALLET。 */
    private String containerType;

    /** 容量。 */
    private BigDecimal capacity;

    /** 容量单位。 */
    private String capacityUnit;

    /** 当前库位编码。 */
    private String currentBinCode;

    /** 条码。 */
    private String barcode;

    /** 容器状态，为空默认 IDLE。 */
    private String containerStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
