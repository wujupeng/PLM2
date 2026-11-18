package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 税率（G1-N5 公共平台底座—多币种多税率 WBS T101）：
 * 按税率编码与适用国家登记，税率以百分数值保存（如 13.0000 表示 13%），带生效区间保证历史单据按当时税率核算。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("sys_tax_rate")
public class SysTaxRate extends BaseEntity {

    /** 税率编号（唯一，支持人工指定）。 */
    private String taxNo;

    /** 税率编码。 */
    private String taxCode;

    /** 税率名称。 */
    private String taxName;

    /** 税率类型：VAT/CIT/OTHER。 */
    private String taxType;

    /** 税率（百分数值）。 */
    private BigDecimal taxRate;

    /** 适用国家。 */
    private String country;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 税率状态：ACTIVE/EXPIRED/DISABLED。 */
    private String taxStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
