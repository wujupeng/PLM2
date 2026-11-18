package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * 包装与标签技术要求（DEV-046）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("spec_packaging")
public class SpecPackaging extends BaseEntity {

    /** 包装规格编码。 */
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

    /** 状态：draft/released 等。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;
}
