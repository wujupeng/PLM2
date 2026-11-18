package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 供应商资质保存请求（SRM 供应商资质）。
 */
@Data
public class SrmSupplierQualificationSaveRequest {

    /** 资质编号（为空时自动生成）。 */
    private String qualificationNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 资质类型，为空默认 BUSINESS_LICENSE。 */
    private String qualificationType;

    /** 资质名称。 */
    private String qualificationName;

    /** 证书编号。 */
    private String certNo;

    /** 发证机构。 */
    private String issueAuthority;

    /** 发证日期。 */
    private LocalDate issueDate;

    /** 到期日期。 */
    private LocalDate expireDate;

    /** 附件地址。 */
    private String attachmentUrl;

    /** 资质状态，为空默认 VALID。 */
    private String qualificationStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
