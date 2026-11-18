package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 生产管理—生产补料单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 登记生产订单的补料物料、补料数量与超领原因，支撑生产补料与超领审批追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_material_addition")
public class ErpMaterialAddition extends BaseEntity {

    /** 补料单号（唯一，支持人工指定，为空时自动生成）。 */
    private String additionNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 补料类型，默认 NORMAL。 */
    private String additionType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 补料数量，默认 0。 */
    private BigDecimal additionQty;

    /** 补料原因。 */
    private String additionReason;

    /** 超领原因。 */
    private String overIssueReason;

    /** 审批状态，默认 PENDING。 */
    private String approvalStatus;

    /** 补料人。 */
    private String additionBy;

    /** 补料日期。 */
    private LocalDateTime additionDate;

    /** 补料状态，默认 DRAFT。 */
    private String additionStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
