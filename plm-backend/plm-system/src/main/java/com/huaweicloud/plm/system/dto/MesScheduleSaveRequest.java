package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 排产计划保存请求。
 */
@Data
public class MesScheduleSaveRequest {

    /** 排产单号（为空时自动生成）。 */
    private String scheduleNo;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 产线编码。 */
    private String lineCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已排产数量。 */
    private BigDecimal scheduledQty;

    /** 排产开始时间。 */
    private LocalDateTime scheduleStartTime;

    /** 排产结束时间。 */
    private LocalDateTime scheduleEndTime;

    /** 排产状态，为空默认 DRAFT。 */
    private String scheduleStatus;

    /** 排产人。 */
    private String scheduler;

    /** 排产时间。 */
    private LocalDateTime scheduleTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
