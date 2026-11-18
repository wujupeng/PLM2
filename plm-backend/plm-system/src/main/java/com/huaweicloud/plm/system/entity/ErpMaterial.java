package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * ERP 基础资料—物料业务档案（G3-N1 ERP 基础资料 WBS T021）：
 * 记录物料的编码、规格、计量单位、计价方式与默认仓库/税码等主数据，
 * 供采购、销售、库存等业务统一引用。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_material")
public class ErpMaterial extends BaseEntity {

    /** 物料档案编号（唯一，支持人工指定，为空时自动生成）。 */
    private String materialNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 物料组。 */
    private String materialGroup;

    /** 基本计量单位，默认 PCS。 */
    private String baseUom;

    /** 采购计量单位。 */
    private String purchaseUom;

    /** 销售计量单位。 */
    private String saleUom;

    /** 计价方式，默认 MOVING_AVG。 */
    private String valuationMethod;

    /** 默认仓库编码。 */
    private String defaultWarehouseCode;

    /** 默认税码。 */
    private String defaultTaxCode;

    /** 安全库存，默认 0。 */
    private BigDecimal safetyStock;

    /** 标准成本。 */
    private BigDecimal stdCost;

    /** 物料状态，默认 ACTIVE。 */
    private String materialStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
