package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 生产管理—订单拆分单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 登记源生产订单向目标生产订单的拆分数量与拆分类型，支撑生产订单拆分追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_production_order_split")
public class ErpProductionOrderSplit extends BaseEntity {

    /** 拆分单号（唯一，支持人工指定，为空时自动生成）。 */
    private String splitNo;

    /** 源生产订单 ID。 */
    private Long sourceOrderId;

    /** 源生产订单号。 */
    private String sourceOrderNo;

    /** 目标生产订单 ID。 */
    private Long targetOrderId;

    /** 目标生产订单号。 */
    private String targetOrderNo;

    /** 拆分数量，默认 0。 */
    private BigDecimal splitQty;

    /** 拆分类型，默认 QTY。 */
    private String splitType;

    /** 拆分原因。 */
    private String splitReason;

    /** 拆分人。 */
    private String splitBy;

    /** 拆分日期。 */
    private LocalDateTime splitDate;

    /** 拆分状态，默认 DRAFT。 */
    private String splitStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
