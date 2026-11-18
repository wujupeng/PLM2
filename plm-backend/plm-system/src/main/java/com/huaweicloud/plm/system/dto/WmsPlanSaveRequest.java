package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 应急预案保存请求（N7，DEV-084）。
 */
@Data
public class WmsPlanSaveRequest {

    /** 关联欠料单号。 */
    private String caseNo;

    /** 关联缺料预警编号。 */
    private String warningNo;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 预案类型：SUBSTITUTE/TRANSFER/EXPEDITE/RESCHEDULE/ESCALATE。 */
    @NotBlank(message = "预案类型不能为空")
    private String planType;

    /** 替代料编码。 */
    private String substituteMaterial;

    /** 目标库位（跨仓调拨）。 */
    private String targetLocationCode;

    /** 供应商编码（加急）。 */
    private String supplierCode;

    /** 预计数量。 */
    private BigDecimal expectedQty;

    /** 预计日期。 */
    private LocalDate expectedDate;

    /** 成本影响。 */
    private String costImpact;

    /** 状态：DRAFT/APPROVED/EXECUTING/COMPLETED/CANCELLED。 */
    private String planStatus;

    private String remark;
}
