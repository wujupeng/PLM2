package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外发料单头（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外发料的加工商、关联委外订单、发料日期、仓库与发料人、状态与数量等主信息，
 * 明细行见 {@link ErpOutsourceIssueLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_issue")
public class ErpOutsourceIssue extends BaseEntity {

    /** 委外发料单号（唯一，支持人工指定，为空时自动生成）。 */
    private String issueNo;

    /** 关联委外订单号。 */
    private String orderNo;

    /** 加工商编码。 */
    private String supplierCode;

    /** 加工商名称。 */
    private String supplierName;

    /** 发料日期。 */
    private LocalDateTime issueDate;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 发料人。 */
    private String issuer;

    /** 发料单状态，默认 DRAFT。 */
    private String issueStatus;

    /** 发料总数量，默认 0。 */
    private BigDecimal totalQty;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
