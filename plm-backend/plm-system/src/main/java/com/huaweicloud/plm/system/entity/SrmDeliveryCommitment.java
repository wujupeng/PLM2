package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 采购协同—交期承诺：登记交期承诺编号、关联订单确认单与采购订单、供应商与物料、
 * 承诺数量、需求日期与承诺日期、延期天数与原因及承诺状态，支撑供应商交期协同追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_delivery_commitment")
public class SrmDeliveryCommitment extends BaseEntity {

    /** 交期承诺编号（为空时自动生成）。 */
    private String commitmentNo;

    /** 订单确认单号。 */
    private String confirmNo;

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

    /** 承诺数量。 */
    private BigDecimal commitmentQty;

    /** 单位。 */
    private String unit;

    /** 需求日期。 */
    private LocalDate requireDate;

    /** 承诺日期。 */
    private LocalDate promiseDate;

    /** 延期天数。 */
    private Integer delayDays;

    /** 延期原因。 */
    private String delayReason;

    /** 承诺人。 */
    private String commitBy;

    /** 承诺日期（登记）。 */
    private LocalDate commitDate;

    /** 承诺状态，默认 PENDING。 */
    private String commitmentStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
