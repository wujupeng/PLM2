package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 基础资料—客户业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 记录客户的编码、类型、销售区域、信用额度与结算方式等主数据，
 * 供销售、发运、应收等业务统一引用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_customer")
public class ErpCustomer extends BaseEntity {

    /** 客户档案编号（唯一，支持人工指定，为空时自动生成）。 */
    private String customerNo;

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 客户简称。 */
    private String shortName;

    /** 客户类型，默认 DIRECT。 */
    private String customerType;

    /** 客户分组。 */
    private String customerGroup;

    /** 销售区域。 */
    private String salesRegion;

    /** 信用额度，默认 0。 */
    private BigDecimal creditLimit;

    /** 信用账期（天），默认 0。 */
    private Integer creditDays;

    /** 结算方式，默认 TRANSFER。 */
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

    /** 客户状态，默认 ACTIVE。 */
    private String customerStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
