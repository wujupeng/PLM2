package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 包装规则保存请求（N8，DEV-089）。
 */
@Data
public class MfgPackageRuleSaveRequest {

    /** 规则编号（可选，留空自动生成）。 */
    private String ruleNo;

    @NotBlank(message = "产品编码不能为空")
    private String productCode;

    /** 包装层级：INNER/OUTER/PALLET。 */
    private String packageLevel;

    /** 单包数量。 */
    private BigDecimal packageQty;

    /** 每箱内装数量。 */
    private BigDecimal innerQtyPerBox;

    /** 每托盘箱数。 */
    private BigDecimal boxPerPallet;

    /** 标签模板编码。 */
    private String labelTemplateCode;

    /** 客户编码。 */
    private String customerCode;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
