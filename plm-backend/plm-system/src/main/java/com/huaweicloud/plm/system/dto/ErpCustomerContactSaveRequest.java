package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 客户联系人保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpCustomerContactSaveRequest {

    /** 联系人编号（为空时自动生成）。 */
    private String contactNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 联系人姓名。 */
    @NotBlank(message = "联系人姓名不能为空")
    private String contactName;

    /** 职务。 */
    private String positionName;

    /** 联系电话。 */
    private String phone;

    /** 电子邮箱。 */
    private String email;

    /** 是否主联系人，为空默认 0。 */
    private Integer isPrimary;

    /** 联系人状态，为空默认 ACTIVE。 */
    private String contactStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
