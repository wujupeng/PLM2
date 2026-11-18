package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 工程变更影响分析（DEV-041）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("eco_impact_analysis")
public class EcoImpactAnalysis extends BaseEntity {

    /** 所属变更单 ID。 */
    private Long ecoId;

    /** 影响类型：bom/inventory/po/wip/supplier/customer。 */
    private String impactType;

    /** 影响对象编码。 */
    private String objectCode;

    /** 影响对象名称。 */
    private String objectName;

    /** 影响对象当前值（版本、状态、数量等）。 */
    private String currentValue;

    /** 影响说明。 */
    private String impactDesc;

    /** 处理状态：pending/handled/ignored。 */
    private String handleStatus;

    /** 处理备注。 */
    private String handleRemark;

    /** 处理时间。 */
    private LocalDateTime handledAt;
}
