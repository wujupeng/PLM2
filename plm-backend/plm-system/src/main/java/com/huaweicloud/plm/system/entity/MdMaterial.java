package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 物料主档（DEV-018 / DEV-019 / DEV-022 / DEV-023）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("md_material")
public class MdMaterial extends BaseEntity {

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 物料分类 ID。 */
    private Long categoryId;

    /** 物料分类编码。 */
    private String categoryCode;

    /** 规格型号。 */
    private String spec;

    /** 物料类型：part/raw/consumable。 */
    private String materialType;

    /** 计量单位。 */
    private String unit;

    /** 来源类型：make=自制，buy=外购。 */
    private String sourceType;

    /** 供应商 ID。 */
    private Long supplierId;

    /** 供应商编码。 */
    private String supplierCode;

    /** 生命周期状态：draft/released/obsolete。 */
    private String lifecycleStatus;

    /** 版本号，如 V1、V2。 */
    private String versionNo;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 淘汰日期。 */
    private LocalDate obsoleteDate;

    /** 标准成本。 */
    private BigDecimal stdCost;

    private String remark;
}
