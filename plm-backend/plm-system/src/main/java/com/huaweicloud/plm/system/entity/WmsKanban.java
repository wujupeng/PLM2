package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 电子看板 Kanban（N7，DEV-076）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_kanban")
public class WmsKanban extends BaseEntity {

    /** 看板编号（唯一）。 */
    private String kanbanNo;

    /** 看板类型：PRODUCTION/SUPPLIER/IN_HOUSE。 */
    private String kanbanType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 补货来源库位。 */
    private String fromLocationCode;

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 单容器数量。 */
    private BigDecimal containerQty;

    /** 补货点。 */
    private BigDecimal replenishPoint;

    /** 最小量。 */
    private BigDecimal minQty;

    /** 最大量。 */
    private BigDecimal maxQty;

    /** 当前数量。 */
    private BigDecimal currentQty;

    /** 看板状态：FULL/EMPTY/REPLENISHING/IDLE。 */
    private String kanbanStatus;

    /** 拉动信号方式：CARD/ELECTRONIC/ANDON。 */
    private String pullSignal;

    /** 供应商编码（供应商看板）。 */
    private String supplierCode;

    /** 提前期（天）。 */
    private Integer leadTimeDays;

    /** 状态：enabled/disabled。 */
    private String status;

    private String remark;
}
