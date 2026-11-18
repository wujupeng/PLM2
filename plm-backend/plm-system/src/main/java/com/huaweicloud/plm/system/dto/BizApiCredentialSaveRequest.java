package com.huaweicloud.plm.system.dto;

import lombok.Data;

/**
 * 集成凭证保存入参（OA-DEV-086 / OA-DEV-094）。
 */
@Data
public class BizApiCredentialSaveRequest {

    private String credentialNo;

    private String credentialName;

    private String appKey;

    private String appSecret;

    /** 所属系统：PLM/ERP/MES/QMS/EDI。 */
    private String ownerSystem;

    /** 有效期至（yyyy-MM-dd）。 */
    private String expireDate;

    private Integer status;

    private String remark;
}
