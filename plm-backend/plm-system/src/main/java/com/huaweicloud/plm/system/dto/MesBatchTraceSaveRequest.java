package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 批次追溯保存请求。
 */
@Data
public class MesBatchTraceSaveRequest {

    /** 批次号（为空时自动生成）。 */
    private String batchNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次状态，为空默认 PENDING。 */
    private String batchStatus;

    /** 工单号。 */
    private String workOrderNo;

    /** 数量。 */
    private BigDecimal quantity;

    /** 单位。 */
    private String unit;

    /** 生产时间。 */
    private LocalDateTime produceTime;

    /** 失效时间。 */
    private LocalDateTime expireTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
