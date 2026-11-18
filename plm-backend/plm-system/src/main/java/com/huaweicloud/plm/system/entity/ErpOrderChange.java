package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * ERP 销售管理—订单变更（G3-N2 ERP 销售管理）：
 * 记录销售订单（含行）变更的变更类型、原因、变更前后值与申请人，
 * 用于订单变更的追溯与审批。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_order_change")
public class ErpOrderChange extends BaseEntity {

    /** 变更单号（唯一，支持人工指定，为空时自动生成）。 */
    private String changeNo;

    /** 关联销售订单编号。 */
    private String orderNo;

    /** 关联订单行号。 */
    private Integer orderLineNo;

    /** 变更类型，默认 QUANTITY。 */
    private String changeType;

    /** 变更原因。 */
    private String changeReason;

    /** 变更前值。 */
    private String beforeValue;

    /** 变更后值。 */
    private String afterValue;

    /** 申请人。 */
    private String applicant;

    /** 申请日期。 */
    private LocalDateTime applyDate;

    /** 变更状态，默认 DRAFT。 */
    private String changeStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
