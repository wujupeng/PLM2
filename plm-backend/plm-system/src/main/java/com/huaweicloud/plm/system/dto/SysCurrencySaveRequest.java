package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 币种保存请求（G1-N5 公共平台底座—多币种多税率 WBS T101）。
 */
@Data
public class SysCurrencySaveRequest {

    /** 币种编码（为空时自动生成）。 */
    @NotBlank(message = "币种编码不能为空")
    private String currencyCode;

    /** 币种名称。 */
    @NotBlank(message = "币种名称不能为空")
    private String currencyName;

    /** 币种符号。 */
    private String currencySymbol;

    /** 金额精度（小数位）。 */
    private Integer currencyPrecision;

    /** 本位币标识：1 本位币，0 非本位币。 */
    private Integer baseFlag;

    /** 适用国家。 */
    private String country;

    /** 币种状态：ACTIVE/DISABLED。 */
    private String currencyStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
