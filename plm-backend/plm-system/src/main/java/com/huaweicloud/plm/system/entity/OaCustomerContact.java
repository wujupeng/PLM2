package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * 客户联系人（OA-DEV-083）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_customer_contact")
public class OaCustomerContact extends BaseEntity {

    /** 客户ID。 */
    private Long customerId;

    /** 联系人姓名。 */
    private String contactName;

    /** 职务。 */
    private String position;

    /** 电话。 */
    private String phone;

    /** 手机。 */
    private String mobile;

    /** 邮箱。 */
    private String email;

    /** 是否主联系人：0 否，1 是。 */
    private Integer isPrimary;

    /** 备注。 */
    private String remark;
}
