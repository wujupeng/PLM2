package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 生产管理—材料领用单头（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 记录生产领料单的领料人、车间、领料日期、领料总数量与状态等主信息，
 * 明细行见 {@link ErpMaterialIssueLine}。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_material_issue")
public class ErpMaterialIssue extends BaseEntity {

    /** 领料单号（唯一，支持人工指定，为空时自动生成）。 */
    private String issueNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 车间。 */
    private String workshop;

    /** 领料人。 */
    private String issueBy;

    /** 领料日期。 */
    private LocalDateTime issueDate;

    /** 领料总数量，默认 0。 */
    private BigDecimal totalQty;

    /** 领料状态，默认 DRAFT。 */
    private String issueStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
