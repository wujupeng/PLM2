package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * SRM→ERP 对账记录：登记 SRM 与 ERP 之间集成对象的对账结果。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("intg_srm_erp_reconcile")
public class IntgSrmErpReconcile extends BaseEntity {

    /** 对账编号（唯一，为空时自动生成）。 */
    private String reconcileNo;

    /** 对账名称。 */
    private String reconcileName;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，默认 SUPPLIER_PROFILE。 */
    private String objectType;

    /** 源端数量，默认 0。 */
    private Integer sourceCount;

    /** 目标端数量，默认 0。 */
    private Integer targetCount;

    /** 差异数量，默认 0。 */
    private Integer diffCount;

    /** 对账日期。 */
    private LocalDateTime reconcileDate;

    /** 对账状态，默认 PENDING。 */
    private String reconcileStatus;

    /** 对账结果信息。 */
    private String resultMessage;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
