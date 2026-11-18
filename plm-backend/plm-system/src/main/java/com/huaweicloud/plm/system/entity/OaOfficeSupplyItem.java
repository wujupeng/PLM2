package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 办公用品目录（OA-DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_office_supply_item")
public class OaOfficeSupplyItem extends BaseEntity {

    /** 物品编码。 */
    private String itemCode;

    /** 物品名称。 */
    private String itemName;

    /** 物品分类。 */
    private String category;

    /** 规格。 */
    private String specification;

    /** 单位：PCS 等。 */
    private String unit;

    /** 单价。 */
    private BigDecimal unitPrice;

    /** 库存数量。 */
    private BigDecimal stockQty;

    /** 安全库存。 */
    private BigDecimal safetyStock;

    /** 是否需库存管理：0 否，1 是。 */
    private Integer needStock;

    /** 状态：0 停用，1 启用。 */
    private Integer status;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 备注。 */
    private String remark;
}
