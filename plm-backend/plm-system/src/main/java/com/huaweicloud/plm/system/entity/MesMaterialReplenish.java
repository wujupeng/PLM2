package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 补料记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_material_replenish")
public class MesMaterialReplenish extends BaseEntity {

    /** 补料单号。 */
    private String replenishNo;

    /** 工单号。 */
    private String workOrderNo;

    /** 派工单号。 */
    private String dispatchNo;

    /** 工序编码。 */
    private String processCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 补料数量。 */
    private BigDecimal replenishQty;

    /** 单位。 */
    private String unit;

    /** 补料类型，默认 SUPPLEMENT。 */
    private String replenishType;

    /** 补料原因。 */
    private String reason;

    /** 申请人。 */
    private String applicant;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 补料状态，默认 DRAFT。 */
    private String replenishStatus;

    /** 发料人。 */
    private String issuer;

    /** 发料时间。 */
    private LocalDateTime issueTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
