package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 基础资料—供应商业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 记录供应商的编码、类型、采购组、结算方式与付款条件等主数据，
 * 供采购、收货、应付等业务统一引用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_supplier")
public class ErpSupplier extends BaseEntity {

    /** 供应商档案编号（唯一，支持人工指定，为空时自动生成）。 */
    private String supplierNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 供应商简称。 */
    private String shortName;

    /** 供应商类型，默认 RAW。 */
    private String supplierType;

    /** 采购组。 */
    private String purchaseGroup;

    /** 采购员姓名。 */
    private String buyerName;

    /** 结算方式，默认 TRANSFER。 */
    private String settleMethod;

    /** 付款条件，默认 NET30。 */
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

    /** 供应商状态，默认 ACTIVE。 */
    private String supplierStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
