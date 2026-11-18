package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * VMI 超容量预警（G5-N8）：
 * 登记库位上 VMI 物料的库位容量、当前数量与使用率，支撑超容量预警追溯与处理。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_vmi_warning")
public class WmsVmiWarning extends BaseEntity {

    /** 预警单号（支持人工指定，为空时自动生成）。 */
    private String warningNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格。 */
    private String spec;

    /** 库位容量。 */
    private BigDecimal capacityQty;

    /** 当前数量。 */
    private BigDecimal currentQty;

    /** 使用率。 */
    private BigDecimal usageRate;

    /** 预警等级，默认 MEDIUM。 */
    private String warningLevel;

    /** 预警状态，默认 PENDING。 */
    private String warningStatus;

    /** 预警时间。 */
    private LocalDateTime warningTime;

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
