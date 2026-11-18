package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商风险（对应 SRM 供应商风险管理）：
 * 登记供应商风险编号、供应商、风险类型与等级、来源、处置措施与处理状态，支撑供应商风险追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_supplier_risk")
public class SrmSupplierRisk extends BaseEntity {

    /** 风险编号（唯一，为空时自动生成）。 */
    private String riskNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 风险类型，默认 QUALITY。 */
    private String riskType;

    /** 风险等级，默认 LOW。 */
    private String riskLevel;

    /** 风险来源。 */
    private String riskSource;

    /** 风险描述。 */
    private String riskDesc;

    /** 发现日期。 */
    private LocalDate discoverDate;

    /** 处置措施。 */
    private String handleMeasure;

    /** 处理人。 */
    private String handler;

    /** 处理日期。 */
    private LocalDate handleDate;

    /** 风险状态，默认 OPEN。 */
    private String riskStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
