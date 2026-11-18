package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 交期评审保存请求（G3-N2 ERP 销售管理）。
 */
@Data
public class ErpDeliveryReviewSaveRequest {

    /** 评审单号（为空时自动生成）。 */
    private String reviewNo;

    /** 销售订单号。 */
    @NotBlank(message = "销售订单号不能为空")
    private String orderNo;

    /** 销售订单行号。 */
    private Integer orderLineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 客户要求交期。 */
    private LocalDateTime customerRequestDate;

    /** 承诺交期。 */
    private LocalDateTime promisedDate;

    /** 评审结果，为空默认 PENDING。 */
    private String reviewResult;

    /** 评审意见。 */
    private String reviewOpinion;

    /** 评审人。 */
    private String reviewer;

    /** 评审日期。 */
    private LocalDateTime reviewDate;

    /** 评审状态，为空默认 OPEN。 */
    private String reviewStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
