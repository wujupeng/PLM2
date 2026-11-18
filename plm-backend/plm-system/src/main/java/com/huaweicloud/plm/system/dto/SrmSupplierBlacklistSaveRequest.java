package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 供应商黑名单保存请求（对应 G4-N1，WBS T031）。
 */
@Data
public class SrmSupplierBlacklistSaveRequest {

    /** 黑名单编号（为空时自动生成）。 */
    private String blacklistNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 黑名单类型，为空默认 TEMPORARY。 */
    private String blacklistType;

    /** 黑名单原因。 */
    private String blacklistReason;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 申请人。 */
    private String applyBy;

    /** 审批人。 */
    private String approver;

    /** 审批日期。 */
    private LocalDate approveDate;

    /** 解除原因。 */
    private String releaseReason;

    /** 黑名单状态，为空默认 ACTIVE。 */
    private String blacklistStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
