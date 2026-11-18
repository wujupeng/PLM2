package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 缺料预警计算请求（N7，DEV-082）：需求 + 库存 + 在途 + 采购交期 + 安全库存的输入。
 */
@Data
public class WmsShortageCalcRequest {

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    @NotNull(message = "需求量不能为空")
    private BigDecimal requiredQty;

    /** 产线。 */
    private String lineCode;

    /** 工单号。 */
    private String workOrderNo;

    /** 需求日期。 */
    private LocalDate requiredDate;

    /** 在途量（为空时取 0；实施时可由 IF-09 接口提供）。 */
    private BigDecimal inTransitQty;

    /** 安全库存（为空时取配置项默认值）。 */
    private BigDecimal safetyStock;

    /** 采购提前期（天，为空时取配置项默认值）。 */
    private Integer purchaseLeadTimeDays;

    private String remark;
}
