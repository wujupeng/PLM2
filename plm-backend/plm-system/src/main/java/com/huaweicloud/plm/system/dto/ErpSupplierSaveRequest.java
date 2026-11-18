package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 供应商业务档案保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpSupplierSaveRequest {

    /** 供应商档案编号（为空时自动生成）。 */
    private String supplierNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    @NotBlank(message = "供应商名称不能为空")
    private String supplierName;

    /** 供应商简称。 */
    private String shortName;

    /** 供应商类型，为空默认 RAW。 */
    private String supplierType;

    /** 采购组。 */
    private String purchaseGroup;

    /** 采购员姓名。 */
    private String buyerName;

    /** 结算方式，为空默认 TRANSFER。 */
    private String settleMethod;

    /** 付款条件，为空默认 NET30。 */
    private String paymentTerm;

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

    /** 供应商状态，为空默认 ACTIVE。 */
    private String supplierStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
