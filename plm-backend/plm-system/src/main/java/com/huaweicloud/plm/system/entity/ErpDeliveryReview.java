package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 销售管理—交期评审（G3-N2 ERP 销售管理）：
 * 记录销售订单行交期的评审结果与承诺交期，供销售、计划与生产协同确认。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_delivery_review")
public class ErpDeliveryReview extends BaseEntity {

    /** 评审单号（唯一，支持人工指定，为空时自动生成）。 */
    private String reviewNo;

    /** 销售订单号。 */
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

    /** 评审结果，默认 PENDING。 */
    private String reviewResult;

    /** 评审意见。 */
    private String reviewOpinion;

    /** 评审人。 */
    private String reviewer;

    /** 评审日期。 */
    private LocalDateTime reviewDate;

    /** 评审状态，默认 OPEN。 */
    private String reviewStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
