package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 来料检验单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_incoming_inspection")
public class MesIncomingInspection extends BaseEntity {

    /** 来料检验单号。 */
    private String incomingNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 采购订单号。 */
    private String purchaseOrderNo;

    /** 检验数量。 */
    private BigDecimal inspectionQty;

    /** 抽样数量。 */
    private BigDecimal sampleQty;

    /** 合格数量。 */
    private BigDecimal qualifiedQty;

    /** 不合格数量。 */
    private BigDecimal unqualifiedQty;

    /** 检验结果。 */
    private String inspectionResult;

    /** 检验状态，默认 PENDING。 */
    private String inspectionStatus;

    /** 检验员。 */
    private String inspector;

    /** 检验时间。 */
    private LocalDateTime inspectionTime;

    /** 判定单号。 */
    private String judgeNo;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
