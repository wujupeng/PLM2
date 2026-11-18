package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * ERP 基础资料—项目档案（G3-N1 ERP 基础资料 WBS T021）：
 * 登记项目主数据，含项目编号/编码/名称、类型、负责人、客户、起止日期与预算金额。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_project")
public class ErpProject extends BaseEntity {

    /** 项目编号（唯一，支持人工指定）。 */
    private String projectNo;

    /** 项目编码。 */
    private String projectCode;

    /** 项目名称。 */
    private String projectName;

    /** 项目类型，默认 INTERNAL。 */
    private String projectType;

    /** 项目负责人。 */
    private String projectManager;

    /** 客户编码。 */
    private String customerCode;

    /** 开始日期。 */
    private LocalDateTime startDate;

    /** 结束日期。 */
    private LocalDateTime endDate;

    /** 预算金额，默认 0。 */
    private BigDecimal budgetAmount;

    /** 项目状态，默认 PLANNING。 */
    private String projectStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
