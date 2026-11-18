package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商全生命周期—供应商黑名单（对应 G4-N1，WBS T031）：
 * 登记供应商黑名单编号、供应商、类型与原因、生效/失效日期、审批与解除信息，支撑供应商黑名单追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_blacklist")
public class SrmSupplierBlacklist extends BaseEntity {

    /** 黑名单编号（唯一，为空时自动生成）。 */
    private String blacklistNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 黑名单类型，默认 TEMPORARY。 */
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

    /** 黑名单状态，默认 ACTIVE。 */
    private String blacklistStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
