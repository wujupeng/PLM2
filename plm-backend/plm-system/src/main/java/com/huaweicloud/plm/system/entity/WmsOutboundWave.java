package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 出库波次单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_outbound_wave")
public class WmsOutboundWave extends BaseEntity {

    /** 波次单号。 */
    private String waveNo;

    /** 波次类型，默认 WAVE。 */
    private String waveType;

    /** 生产工单号。 */
    private String workOrderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 计划数量。 */
    private BigDecimal planQty;

    /** 已拣数量。 */
    private BigDecimal pickedQty;

    /** 复核数量。 */
    private BigDecimal checkedQty;

    /** 波次状态，默认 DRAFT。 */
    private String waveStatus;

    /** 拣货人。 */
    private String pickBy;

    /** 拣货时间。 */
    private LocalDateTime pickTime;

    /** 复核人。 */
    private String checkBy;

    /** 复核时间。 */
    private LocalDateTime checkTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
