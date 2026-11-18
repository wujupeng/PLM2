package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 办公用品申请明细（OA-DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_office_supply_request_item")
public class OaOfficeSupplyRequestItem extends BaseEntity {

    /** 申请单ID。 */
    private Long requestId;

    /** 物品ID。 */
    private Long itemId;

    /** 物品编码。 */
    private String itemCode;

    /** 物品名称。 */
    private String itemName;

    /** 单位。 */
    private String unit;

    /** 申请数量。 */
    private BigDecimal requestQty;

    /** 发放数量。 */
    private BigDecimal issueQty;

    /** 排序号。 */
    private Integer sortNo;

    /** 备注。 */
    private String remark;
}
