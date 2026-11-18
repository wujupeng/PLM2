package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 扫码领料校验请求（N7，DEV-078/080）：工单/物料/批次/库位/数量/目标产线工位的扫码结果。
 */
@Data
public class WmsPickVerifyRequest {

    @NotBlank(message = "工单号不能为空")
    private String workOrderNo;

    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    @NotBlank(message = "批次号不能为空")
    private String batchNo;

    @NotBlank(message = "产线不能为空")
    private String lineCode;

    @NotBlank(message = "工位不能为空")
    private String workStation;

    @NotNull(message = "领用数量不能为空")
    private BigDecimal qty;

    /** 库位（可选，用于定位批次）。 */
    private String locationCode;

    /** 容器编码（可选）。 */
    private String containerCode;

    /** 单位。 */
    private String unit;

    /** 操作人。 */
    private String operatorName;

    /** 是否申请 FIFO 例外授权。 */
    private Boolean authorizeException;

    /** 授权人。 */
    private String authorizedBy;

    /** 授权原因。 */
    private String authorizeReason;

    /** 关联配送任务号。 */
    private String relatedDeliveryNo;

    private String remark;
}
