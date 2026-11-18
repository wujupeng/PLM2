package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 批次追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mes_batch_trace")
public class MesBatchTrace extends BaseEntity {

    /** 批次号。 */
    private String batchNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次状态，默认 PENDING。 */
    private String batchStatus;

    /** 工单号。 */
    private String workOrderNo;

    /** 数量。 */
    private BigDecimal quantity;

    /** 单位。 */
    private String unit;

    /** 生产时间。 */
    private LocalDateTime produceTime;

    /** 失效时间。 */
    private LocalDateTime expireTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
