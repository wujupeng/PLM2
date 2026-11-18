package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 供应商门户账号保存请求（对应供应商门户账号）。
 */
@Data
public class SrmPortalAccountSaveRequest {

    /** 门户账号编号（为空时自动生成）。 */
    private String accountNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 登录名。 */
    @NotBlank(message = "登录名不能为空")
    private String loginName;

    /** 联系人。 */
    private String contactName;

    /** 联系电话。 */
    private String contactPhone;

    /** 联系邮箱。 */
    private String contactEmail;

    /** 门户角色，为空默认 VIEWER。 */
    private String portalRole;

    /** 协同范围，逗号分隔：ORDER,DELIVERY,QUALITY,ASN。 */
    private String collabScope;

    /** 生效日期。 */
    private LocalDate validFrom;

    /** 失效日期。 */
    private LocalDate validTo;

    /** 账号状态，为空默认 DRAFT。 */
    private String accountStatus;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
