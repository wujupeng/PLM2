package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 库存核算—库存报废单（对应 WBS T027 库存核算、T097 库存业务，属 G3 ERP）：
 * 登记物料的报废数量、报废类型与报废原因，支撑库存报废追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_inventory_scrap")
public class ErpInventoryScrap extends BaseEntity {

    /** 报废单号（唯一，为空时自动生成）。 */
    private String scrapNo;

    /** 报废类型，默认 NORMAL。 */
    private String scrapType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码，默认空字符串。 */
    private String locationCode;

    /** 批次号，默认空字符串。 */
    private String batchNo;

    /** 报废数量，默认 0。 */
    private BigDecimal scrapQty;

    /** 报废原因。 */
    private String scrapReason;

    /** 报废人。 */
    private String scrapBy;

    /** 报废日期。 */
    private LocalDateTime scrapDate;

    /** 报废状态，默认 DRAFT。 */
    private String scrapStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
