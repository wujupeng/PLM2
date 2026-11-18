package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 防混料绑定（N7，DEV-080）：物料/批次/容器/工位绑定与扫描复核依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_material_binding")
public class WmsMaterialBinding extends BaseEntity {

    /** 绑定编号（唯一）。 */
    private String bindingNo;

    /** 绑定类型：LINE_MATERIAL/LINE_BATCH/STATION_CONTAINER。 */
    private String bindType;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 容器编码。 */
    private String containerCode;

    /** 生效开始时间。 */
    private LocalDateTime effectiveFrom;

    /** 生效结束时间。 */
    private LocalDateTime effectiveTo;

    /** 状态：enabled/disabled。 */
    private String bindStatus;

    private String remark;
}
