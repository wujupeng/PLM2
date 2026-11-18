package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 请购单头保存请求（对应 WBS T023 采购管理、T093 采购到货入库，属 G3 ERP）。
 */
@Data
public class ErpPurchaseRequisitionSaveRequest {

    /** 请购单号（为空时自动生成）。 */
    private String requisitionNo;

    /** 请购类型，为空默认 NORMAL。 */
    private String requisitionType;

    /** 请购组织。 */
    private String reqOrg;

    /** 请购人。 */
    private String applicant;

    /** 申请日期。 */
    private LocalDateTime applyDate;

    /** 需求日期。 */
    private LocalDateTime requiredDate;

    /** 币别，为空默认 CNY。 */
    private String currencyCode;

    /** 来源类型，为空默认 MANUAL。 */
    private String sourceType;

    /** 请购单状态，为空默认 DRAFT。 */
    private String requisitionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
