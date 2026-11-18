package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 订单变更保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpOrderChangeSaveRequest {

    /** 变更单号（为空时自动生成）。 */
    private String changeNo;

    /** 关联销售订单编号。 */
    @NotBlank(message = "订单编号不能为空")
    private String orderNo;

    /** 关联订单行号。 */
    private Integer orderLineNo;

    /** 变更类型，为空默认 QUANTITY。 */
    private String changeType;

    /** 变更原因。 */
    private String changeReason;

    /** 变更前值。 */
    private String beforeValue;

    /** 变更后值。 */
    private String afterValue;

    /** 申请人。 */
    private String applicant;

    /** 申请日期。 */
    private LocalDateTime applyDate;

    /** 变更状态，为空默认 DRAFT。 */
    private String changeStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
