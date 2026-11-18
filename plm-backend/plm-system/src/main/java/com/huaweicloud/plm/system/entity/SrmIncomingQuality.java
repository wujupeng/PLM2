package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 供应商质量—来料质量：登记来料检验单号、采购订单号与供应商物料、批次与收货数量、
 * 抽检数量、不良数量与不良率、检验结果与判定说明及检验状态，支撑来料质量追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_incoming_quality")
public class SrmIncomingQuality extends BaseEntity {

    /** 来料检验单号（为空时自动生成）。 */
    private String iqcNo;

    /** 采购订单号。 */
    private String poNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 收货数量。 */
    private BigDecimal receiveQty;

    /** 单位。 */
    private String unit;

    /** 抽检数量。 */
    private BigDecimal sampleQty;

    /** 不良数量。 */
    private BigDecimal defectQty;

    /** 不良率%。 */
    private BigDecimal defectRate;

    /** 检验结果，默认 PENDING。 */
    private String inspectionResult;

    /** 不良描述。 */
    private String defectDesc;

    /** 检验员。 */
    private String inspector;

    /** 检验日期。 */
    private LocalDate inspectDate;

    /** 检验状态，默认 DRAFT。 */
    private String iqcStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
