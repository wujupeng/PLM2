package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * MES 工时记录保存请求。
 */
@Data
public class MesLaborHourSaveRequest {

    /** 工时单号（为空时自动生成）。 */
    private String laborNo;

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

    /** 作业人员。 */
    private String worker;

    /** 班次编码。 */
    private String shiftCode;

    /** 工作日期。 */
    private LocalDateTime workDate;

    /** 正常工时。 */
    private BigDecimal normalHours;

    /** 加班工时。 */
    private BigDecimal overtimeHours;

    /** 合计工时。 */
    private BigDecimal totalHours;

    /** 工时状态，为空默认 DRAFT。 */
    private String laborStatus;

    /** 确认时间。 */
    private LocalDateTime confirmTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
