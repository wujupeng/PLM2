package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 采购管理—请购单头（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）：
 * 记录请购单的组织、请购人、请购类型、来源、币别与状态等主信息，
 * 明细行见 {@link ErpPurchaseRequisitionLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_requisition")
public class ErpPurchaseRequisition extends BaseEntity {

    /** 请购单号（唯一，支持人工指定，为空时自动生成）。 */
    private String requisitionNo;

    /** 请购类型，默认 NORMAL。 */
    private String requisitionType;

    /** 请购组织。 */
    private String reqOrg;

    /** 请购人。 */
    private String applicant;

    /** 申请日期。 */
    private LocalDateTime applyDate;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 币别，默认 CNY。 */
    private String currencyCode;

    /** 来源类型，默认 MANUAL。 */
    private String sourceType;

    /** 请购单状态，默认 DRAFT。 */
    private String requisitionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
