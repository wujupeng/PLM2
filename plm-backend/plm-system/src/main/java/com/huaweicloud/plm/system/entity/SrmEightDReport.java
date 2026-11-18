package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDate;

/**
 * SRM 供应商质量—8D 报告：登记 8D 编号、供应商与物料、问题来源与描述、
 * D1-D8 各步骤内容、发生与关闭日期及报告状态，支撑供应商问题闭环追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_eight_d")
public class SrmEightDReport extends BaseEntity {

    /** 8D 编号（为空时自动生成）。 */
    private String eightdNo;

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

    /** 报告状态，默认 DRAFT。 */
    private String eightdStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
