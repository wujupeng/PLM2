package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商资质：
 * 登记资质编号、供应商、资质类型与证书、发证机构、有效期及附件，支撑供应商资质维护与追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_qualification")
public class SrmSupplierQualification extends BaseEntity {

    /** 资质编号（唯一，为空时自动生成）。 */
    private String qualificationNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 资质类型，默认 BUSINESS_LICENSE。 */
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

    /** 资质状态，默认 VALID。 */
    private String qualificationStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
