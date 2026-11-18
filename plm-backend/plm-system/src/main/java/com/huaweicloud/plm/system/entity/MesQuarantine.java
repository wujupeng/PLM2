package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 隔离记录。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_quarantine")
public class MesQuarantine extends BaseEntity {

    /** 隔离单号。 */
    private String quarantineNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 隔离数量。 */
    private BigDecimal quarantineQty;

    /** 隔离类型，默认 SUSPECT。 */
    private String quarantineType;

    /** 隔离状态，默认 PENDING。 */
    private String quarantineStatus;

    /** 来源单号。 */
    private String sourceNo;

    /** 隔离位置。 */
    private String location;

    /** 隔离原因。 */
    private String reason;

    /** 申请人。 */
    private String applicant;

    /** 申请时间。 */
    private LocalDateTime applyTime;

    /** 处理人。 */
    private String handler;

    /** 处理时间。 */
    private LocalDateTime handleTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
