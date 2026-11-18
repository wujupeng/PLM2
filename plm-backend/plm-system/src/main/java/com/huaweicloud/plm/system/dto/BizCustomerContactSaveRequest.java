package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 客户联系人保存入参（OA-DEV-083）。
 */
@Data
public class BizCustomerContactSaveRequest {

    private String contactName;

    private String position;

    private String phone;

    private String mobile;

    private String email;

    /** 是否主联系人。 */
    private Boolean isPrimary;

    private String remark;
}
