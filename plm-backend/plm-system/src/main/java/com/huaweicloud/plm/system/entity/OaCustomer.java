package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户档案（OA-DEV-083，主数据权威归属待确认）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_customer")
public class OaCustomer extends BaseEntity {

    /** 客户编码。 */
    private String customerCode;

    /** 客户名称。 */
    private String customerName;

    /** 客户简称。 */
    private String shortName;

    /** 客户等级：NORMAL/VIP 等。 */
    private String customerLevel;

    /** 客户状态：ACTIVE/INACTIVE 等。 */
    private String customerStatus;

    /** 所属行业。 */
    private String industry;

    /** 所属区域。 */
    private String region;

    /** 地址。 */
    private String address;

    /** 统一社会信用代码。 */
    private String creditCode;

    /** 税号。 */
    private String taxNo;

    /** 销售负责人用户ID。 */
    private Long salesOwnerUserId;

    /** 销售负责人姓名。 */
    private String salesOwnerName;

    /** 联系人数。 */
    private Integer contactCount;

    /** 数据来源：OA/ERP/CRM 等。 */
    private String dataSource;

    /** ERP关联单号。 */
    private String erpRefNo;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
