package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 采购管理—采购报检/检验单（G3-N3a ERP 采购管理）：
 * 记录到货物料的检验类型、检验数量、合格/不合格数量与检验结果，
 * 用于区分免检与检验物料。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_purchase_inspection")
public class ErpPurchaseInspection extends BaseEntity {

    /** 检验单号（唯一，支持人工指定，为空时自动生成）。 */
    private String inspectionNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 采购订单编号。 */
    private String orderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 检验类型，默认 FULL。 */
    private String inspectionType;

    /** 检验数量，默认 0。 */
    private BigDecimal inspectionQty;

    /** 合格数量，默认 0。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量，默认 0。 */
    private BigDecimal rejectedQty;

    /** 检验结果，默认 PENDING。 */
    private String inspectionResult;

    /** 检验员。 */
    private String inspector;

    /** 检验日期。 */
    private LocalDateTime inspectionDate;

    /** 检验状态，默认 OPEN。 */
    private String inspectionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
