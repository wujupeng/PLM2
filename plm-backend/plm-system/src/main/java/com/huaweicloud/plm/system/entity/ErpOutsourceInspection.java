package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外报检单（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外到货后的报检/检验类型、报检数量与合格/不合格数量及检验结果，
 * 作为委外入库放行与质量判定的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_inspection")
public class ErpOutsourceInspection extends BaseEntity {

    /** 报检单号（唯一，支持人工指定，为空时自动生成）。 */
    private String inspectionNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 检验类型，默认 FULL。 */
    private String inspectionType;

    /** 报检数量，默认 0。 */
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

    /** 报检单状态，默认 OPEN。 */
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
