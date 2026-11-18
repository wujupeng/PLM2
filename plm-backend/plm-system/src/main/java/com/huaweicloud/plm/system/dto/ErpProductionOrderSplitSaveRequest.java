package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 订单拆分单保存请求（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）。
 */
@Data
public class ErpProductionOrderSplitSaveRequest {

    /** 拆分单号（为空时自动生成）。 */
    private String splitNo;

    /** 源生产订单 ID。 */
    private Long sourceOrderId;

    /** 源生产订单号。 */
    private String sourceOrderNo;

    /** 目标生产订单 ID。 */
    private Long targetOrderId;

    /** 目标生产订单号。 */
    private String targetOrderNo;

    /** 拆分数量，为空默认 0。 */
    private BigDecimal splitQty;

    /** 拆分类型，为空默认 QTY。 */
    private String splitType;

    /** 拆分原因。 */
    private String splitReason;

    /** 拆分人。 */
    private String splitBy;

    /** 拆分日期。 */
    private LocalDateTime splitDate;

    /** 拆分状态，为空默认 DRAFT。 */
    private String splitStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
