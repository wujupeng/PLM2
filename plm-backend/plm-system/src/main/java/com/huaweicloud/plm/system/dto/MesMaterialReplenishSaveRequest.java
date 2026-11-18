package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 补料记录保存请求。
 */
@Data
public class MesMaterialReplenishSaveRequest {

    /** 补料单号（为空时自动生成）。 */
    private String replenishNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 补料数量。 */
    private BigDecimal replenishQty;

    /** 单位。 */
    private String unit;

    /** 补料类型，为空默认 SUPPLEMENT。 */
    private String replenishType;

    /** 补料原因。 */
    private String reason;

    /** 申请人。 */
    private String applicant;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 补料状态，为空默认 DRAFT。 */
    private String replenishStatus;

    /** 发料人。 */
    private String issuer;

    /** 发料时间。 */
    private LocalDateTime issueTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
