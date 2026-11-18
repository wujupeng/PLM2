package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;

/**
 * 供应商风险保存请求（对应 SRM 供应商风险管理）。
 */
@Data
public class SrmSupplierRiskSaveRequest {

    /** 风险编号（为空时自动生成）。 */
    private String riskNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 风险类型，为空默认 QUALITY。 */
    private String riskType;

    /** 风险等级，为空默认 LOW。 */
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

    /** 风险状态，为空默认 OPEN。 */
    private String riskStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
