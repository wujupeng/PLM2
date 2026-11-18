package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 客户业务档案保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpCustomerSaveRequest {

    /** 客户档案编号（为空时自动生成）。 */
    private String customerNo;

    /** 客户编码。 */
    @NotBlank(message = "客户编码不能为空")
    private String customerCode;

    /** 客户名称。 */
    @NotBlank(message = "客户名称不能为空")
    private String customerName;

    /** 客户简称。 */
    private String shortName;

    /** 客户类型，为空默认 DIRECT。 */
    private String customerType;

    /** 客户分组。 */
    private String customerGroup;

    /** 销售区域。 */
    private String salesRegion;

    /** 信用额度，为空默认 0。 */
    private BigDecimal creditLimit;

    /** 信用账期（天），为空默认 0。 */
    private Integer creditDays;

    /** 结算方式，为空默认 TRANSFER。 */
    private String settleMethod;

    /** 税码。 */
    private String taxCode;

    /** 联系人。 */
    private String contact;

    /** 联系电话。 */
    private String phone;

    /** 电子邮箱。 */
    private String email;

    /** 地址。 */
    private String address;

    /** 客户状态，为空默认 ACTIVE。 */
    private String customerStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
