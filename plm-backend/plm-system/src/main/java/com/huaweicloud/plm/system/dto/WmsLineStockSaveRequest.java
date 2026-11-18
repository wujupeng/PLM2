package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 线边库存保存请求（N7，DEV-081）。
 */
@Data
public class WmsLineStockSaveRequest {

    @NotBlank(message = "产线不能为空")
    private String lineCode;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 工位。 */
    private String workStation;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 容器编码。 */
    private String containerCode;

    /** 单位。 */
    private String unit;

    /** 安全库存。 */
    private BigDecimal safetyStock;

    /** 库存状态：NORMAL/WARNING/SHORTAGE，默认 NORMAL。 */
    private String stockStatus;

    private String remark;
}
