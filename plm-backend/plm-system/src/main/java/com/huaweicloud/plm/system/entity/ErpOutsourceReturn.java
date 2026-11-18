package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外退货单（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）：
 * 登记委外到货后不合格或需退供应商的物料退货数量、退货原因与退货金额，
 * 作为委外退货处理与费用冲减的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_return")
public class ErpOutsourceReturn extends BaseEntity {

    /** 退货单号（唯一，支持人工指定，为空时自动生成）。 */
    private String returnNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 委外到货单号。 */
    private String receiptNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 退货日期。 */
    private LocalDateTime returnDate;

    /** 退货数量，默认 0。 */
    private BigDecimal returnQty;

    /** 退货原因。 */
    private String returnReason;

    /** 退货金额，默认 0。 */
    private BigDecimal returnAmount;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 退货单状态，默认 DRAFT。 */
    private String returnStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
