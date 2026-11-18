package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 含税/未税价格规则保存请求（G1-N5 公共平台底座—多币种多税率 WBS T101）。
 */
@Data
public class SysPriceRuleSaveRequest {

    /** 规则编号（为空时自动生成）。 */
    private String ruleNo;

    /** 规则编码。 */
    private String ruleCode;

    /** 规则名称。 */
    @NotBlank(message = "规则名称不能为空")
    private String ruleName;

    /** 业务模块：PLM/ERP/SRM/MES/WMS/OA。 */
    private String bizModule;

    /** 价格口径：TAX_INCLUSIVE/TAX_EXCLUSIVE。 */
    private String priceMode;

    /** 关联税率编码。 */
    private String taxCode;

    /** 舍入方式：HALF_UP/HALF_EVEN/UP/DOWN。 */
    private String roundingMode;

    /** 金额精度（小数位）。 */
    private Integer precisionDigits;

    /** 规则状态：ACTIVE/DISABLED。 */
    private String ruleStatus;

    /** 描述。 */
    private String description;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
