package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VMI 超容量预警保存请求（G5-N8）。
 */
@Data
public class WmsVmiWarningSaveRequest {

    /** 预警单号（为空时自动生成）。 */
    private String warningNo;

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

    /** 当前数量。 */
    private BigDecimal currentQty;

    /** 使用率。 */
    private BigDecimal usageRate;

    /** 预警等级，为空默认 MEDIUM。 */
    private String warningLevel;

    /** 预警状态，为空默认 PENDING。 */
    private String warningStatus;

    /** 预警时间。 */
    private LocalDateTime warningTime;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
