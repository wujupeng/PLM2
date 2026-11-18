package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 质量问题登记请求。
 */
@Data
public class QualityIssueSaveRequest {

    @NotBlank(message = "问题标题不能为空")
    private String title;

    /** 来源类型：internal/customer/supplier/inspection，为空时默认 internal。 */
    private String sourceType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 工序编码。 */
    private String operationCode;

    /** 缺陷代码，传入且开启自动带出时补齐缺陷名称、责任部门、严重度、默认措施与原因。 */
    private String defectCode;

    /** 缺陷名称。 */
    private String defectName;

    /** 严重度：minor/major/critical。 */
    private String severity;

    /** 不良数量。 */
    private BigDecimal foundQty;

    /** 问题描述。 */
    private String issueDesc;

    /** 责任部门。 */
    private String responsibleDept;

    /** 责任人 ID。 */
    private Long responsibleId;

    /** 责任人姓名。 */
    private String responsibleName;

    /** 临时措施。 */
    private String tempAction;

    /** 根因分析。 */
    private String rootCause;

    /** 永久措施。 */
    private String permanentAction;

    /** 发现时间，为空时默认当前时间。 */
    private LocalDateTime foundAt;

    private String remark;
}
