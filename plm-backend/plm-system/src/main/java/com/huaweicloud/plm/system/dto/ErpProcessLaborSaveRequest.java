package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工艺资源—工时反馈保存请求（对应 G3-N7b ERP 工艺资源—工时反馈）。
 */
@Data
public class ErpProcessLaborSaveRequest {

    /** 反馈单号（为空时自动生成）。 */
    private String feedbackNo;

    /** 计划单号。 */
    private String planNo;

    /** 报工单号。 */
    private String reportNo;

    /** 资源编码。 */
    private String resourceCode;

    /** 操作工。 */
    private String operatorName;

    /** 工时类型，为空默认 RUN。 */
    private String laborType;

    /** 标准工时，为空默认 0。 */
    private BigDecimal standardHours;

    /** 实际工时，为空默认 0。 */
    private BigDecimal actualHours;

    /** 开始时间。 */
    private LocalDateTime startTime;

    /** 结束时间。 */
    private LocalDateTime endTime;

    /** 工时状态，为空默认 DRAFT。 */
    private String laborStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
