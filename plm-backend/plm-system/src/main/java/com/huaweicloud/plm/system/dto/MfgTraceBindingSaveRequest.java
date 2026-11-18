package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 追溯码绑定保存请求（N8，DEV-088）。
 */
@Data
public class MfgTraceBindingSaveRequest {

    /** 绑定编号（可选，留空自动生成）。 */
    private String bindingNo;

    @NotBlank(message = "追溯码不能为空")
    private String traceCode;

    /** 追溯类型：SINGLE/BATCH。 */
    private String traceType;

    /** 生产批次号。 */
    private String batchNo;

    /** 序列号。 */
    private String serialNo;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 物料供应商。 */
    private String materialSupplier;

    /** 装配工序。 */
    private String operationCode;

    /** 数量。 */
    private BigDecimal quantity;

    /** 单位。 */
    private String unit;

    /** 绑定时间。 */
    private LocalDateTime bindTime;

    /** 来源系统。 */
    private String sourceSystem;

    private String remark;
}
