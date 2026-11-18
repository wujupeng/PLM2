package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 寻源与询报价—询价邀请供应商（对应询价邀请供应商）：
 * 登记邀请单号、询价单号、供应商与联系方式、邀请与应答日期、邀请状态及拒绝原因，支撑询价邀请追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_rfq_supplier")
public class SrmRfqSupplier extends BaseEntity {

    /** 邀请单号（唯一，为空时自动生成）。 */
    private String inviteNo;

    /** 询价单号。 */
    private String rfqNo;

    /** 供应商编码。 */
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

    /** 邀请状态，默认 INVITED。 */
    private String inviteStatus;

    /** 拒绝原因。 */
    private String declineReason;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
