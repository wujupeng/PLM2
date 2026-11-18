package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 法人主体保存请求（G1-N5 公共平台底座—多组织多工厂 WBS T100）。
 */
@Data
public class SysLegalEntitySaveRequest {

    /** 法人编码（为空时自动生成）。 */
    private String legalCode;

    /** 法人名称。 */
    @NotBlank(message = "法人名称不能为空")
    private String legalName;

    /** 统一社会信用代码。 */
    private String unifiedSocialCode;

    /** 税号。 */
    private String taxNo;

    /** 法定代表人。 */
    private String legalRep;

    /** 本位币。 */
    private String baseCurrency;

    /** 国家。 */
    private String country;

    /** 地区。 */
    private String region;

    /** 地址。 */
    private String address;

    /** 联系电话。 */
    private String contactPhone;

    /** 法人状态：ACTIVE/DISABLED。 */
    private String legalStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
