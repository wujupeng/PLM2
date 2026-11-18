package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 包装与标签技术要求保存请求。
 */
@Data
public class SpecPackagingSaveRequest {

    @NotBlank(message = "包装规格编码不能为空")
    private String packagingCode;

    /** 产品编码。 */
    private String productCode;

    /** 产品名称。 */
    private String productName;

    /** 客户编码。 */
    private String customerCode;

    /** 版本号。 */
    private String versionNo;

    /** 包装数量。 */
    private Integer packQty;

    /** 标签模板编码。 */
    private String labelTemplateCode;

    /** 二维码规则键。 */
    private String qrRuleKey;

    /** 包装材料。 */
    private String packagingMaterial;

    /** 尺寸描述。 */
    private String dimensionText;

    /** 特殊要求。 */
    private String specialRequirement;

    /** 状态。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;
}
