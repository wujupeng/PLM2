package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 询价邀请供应商保存请求（对应询价邀请供应商）。
 */
@Data
public class SrmRfqSupplierSaveRequest {

    /** 邀请单号（为空时自动生成）。 */
    private String inviteNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 联系人。 */
    private String contact;

    /** 联系电话。 */
    private String phone;

    /** 联系邮箱。 */
    private String email;

    /** 邀请日期。 */
    private LocalDate inviteDate;

    /** 应答日期。 */
    private LocalDate respondDate;

    /** 邀请状态，为空默认 INVITED。 */
    private String inviteStatus;

    /** 拒绝原因。 */
    private String declineReason;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
