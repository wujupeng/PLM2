package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—形态转换单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 登记源物料向目标物料的形态转换数量与转换类型，支撑库存形态转换追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_conversion")
public class ErpInventoryConversion extends BaseEntity {

    /** 转换单号（唯一，支持人工指定，为空时自动生成）。 */
    private String conversionNo;

    /** 转换类型，默认 SPLIT。 */
    private String conversionType;

    /** 源物料编码。 */
    private String sourceMaterialCode;

    /** 源物料名称。 */
    private String sourceMaterialName;

    /** 源物料规格。 */
    private String sourceSpec;

    /** 源计量单位，默认 PCS。 */
    private String sourceUom;

    /** 源数量，默认 0。 */
    private BigDecimal sourceQty;

    /** 源批次号，默认空字符串。 */
    private String sourceBatchNo;

    /** 目标物料编码。 */
    private String targetMaterialCode;

    /** 目标物料名称。 */
    private String targetMaterialName;

    /** 目标物料规格。 */
    private String targetSpec;

    /** 目标计量单位，默认 PCS。 */
    private String targetUom;

    /** 目标数量，默认 0。 */
    private BigDecimal targetQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 转换人。 */
    private String conversionBy;

    /** 转换日期。 */
    private LocalDateTime conversionDate;

    /** 转换状态，默认 DRAFT。 */
    private String conversionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
