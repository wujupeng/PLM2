package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 采购协同—变更确认：登记采购订单变更编号、采购订单号与供应商物料、变更类型、
 * 变更前后数量/交期/价格、变更原因与申请确认信息及变更状态，支撑订单变更协同追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_po_change")
public class SrmPoChange extends BaseEntity {

    /** 变更编号（为空时自动生成）。 */
    private String changeNo;

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

    /** 变更类型，默认 QTY。 */
    private String changeType;

    /** 变更前数量。 */
    private BigDecimal beforeQty;

    /** 变更后数量。 */
    private BigDecimal afterQty;

    /** 变更前交期。 */
    private LocalDate beforeDate;

    /** 变更后交期。 */
    private LocalDate afterDate;

    /** 变更前价格。 */
    private BigDecimal beforePrice;

    /** 变更后价格。 */
    private BigDecimal afterPrice;

    /** 变更原因。 */
    private String changeReason;

    /** 申请人。 */
    private String applyBy;

    /** 申请日期。 */
    private LocalDate applyDate;

    /** 确认人。 */
    private String confirmBy;

    /** 确认日期。 */
    private LocalDate confirmDate;

    /** 变更状态，默认 PENDING。 */
    private String changeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
