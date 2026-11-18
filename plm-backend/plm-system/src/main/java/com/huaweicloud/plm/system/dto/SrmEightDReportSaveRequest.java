package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 8D 报告保存请求（对应 8D 报告）。
 */
@Data
public class SrmEightDReportSaveRequest {

    /** 8D 编号（为空时自动生成）。 */
    private String eightdNo;

    /** 供应商编码。 */
    @NotBlank(message = "供应商编码不能为空")
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 问题来源。 */
    private String problemSource;

    /** 问题描述。 */
    private String problemDesc;

    /** D1 小组成员。 */
    private String d1Team;

    /** D2 问题说明。 */
    private String d2Problem;

    /** D3 临时遏制措施。 */
    private String d3Containment;

    /** D4 根本原因。 */
    private String d4RootCause;

    /** D5 永久纠正措施。 */
    private String d5Corrective;

    /** D6 措施实施。 */
    private String d6Implement;

    /** D7 预防再发。 */
    private String d7Prevent;

    /** D8 团队祝贺。 */
    private String d8Congratulate;

    /** 发生日期。 */
    private LocalDate issueDate;

    /** 关闭日期。 */
    private LocalDate closeDate;

    /** 负责人。 */
    private String owner;

    /** 报告状态，为空默认 DRAFT。 */
    private String eightdStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
