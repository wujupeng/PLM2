package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 客户档案保存入参（OA-DEV-083）。客户主数据权威归属 ERP/CRM。
 */
@Data
public class BizCustomerSaveRequest {

    private String customerCode;

    private String customerName;

    private String shortName;

    /** 客户级别：可配置字典 oa_customer_level。 */
    private String customerLevel;

    /** 客户状态：可配置字典 oa_customer_status。 */
    private String customerStatus;

    private String industry;

    private String region;

    private String address;

    private String creditCode;

    private String taxNo;

    private Long salesOwnerUserId;

    private String salesOwnerName;

    private String erpRefNo;

    private String remark;
}
