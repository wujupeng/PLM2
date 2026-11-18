package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 生产工单保存请求。
 */
@Data
public class MesProdOrderSaveRequest {

    /** 工单号（为空时自动生成）。 */
    private String orderNo;

    /** ERP工单号。 */
    private String erpOrderNo;

    /** 工单来源，为空默认 ERP。 */
    private String orderSource;

    /** 物料编码。 */
    @NotBlank(message = "物料编码不能为空")
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已生产数量。 */
    private BigDecimal productQty;

    /** 工单状态，为空默认 DRAFT。 */
    private String orderStatus;

    /** 优先级，为空默认 NORMAL。 */
    private String priority;

    /** 车间编码。 */
    private String workshopCode;

    /** 计划开始时间。 */
    private LocalDateTime planStartTime;

    /** 计划结束时间。 */
    private LocalDateTime planEndTime;

    /** 接收时间。 */
    private LocalDateTime receiveTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
