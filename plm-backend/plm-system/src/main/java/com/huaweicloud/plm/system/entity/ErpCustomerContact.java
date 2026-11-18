package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 基础资料—客户联系人（G3-N1 ERP 基础资料 WBS T021）：
 * 登记客户联系人主数据，含所在客户、职务、联系方式与主联系人标识。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_customer_contact")
public class ErpCustomerContact extends BaseEntity {

    /** 联系人编号（唯一，支持人工指定）。 */
    private String contactNo;

    /** 客户编码。 */
    private String customerCode;

    /** 联系人姓名。 */
    private String contactName;

    /** 职务。 */
    private String positionName;

    /** 联系电话。 */
    private String phone;

    /** 电子邮箱。 */
    private String email;

    /** 是否主联系人，默认 0。 */
    private Integer isPrimary;

    /** 联系人状态，默认 ACTIVE。 */
    private String contactStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
