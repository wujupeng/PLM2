package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 线边库存（N7，DEV-081）：发料/消耗/退料/报废/盘点差异的当前账。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_line_side_stock")
public class WmsLineSideStock extends BaseEntity {

    /** 产线。 */
    private String lineCode;

    /** 工位。 */
    private String workStation;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 容器编码。 */
    private String containerCode;

    /** 单位。 */
    private String unit;

    /** 现有数量。 */
    private BigDecimal qtyOnHand;

    /** 累计发料数量。 */
    private BigDecimal qtyIssued;

    /** 累计消耗数量。 */
    private BigDecimal qtyConsumed;

    /** 累计退料数量。 */
    private BigDecimal qtyReturned;

    /** 累计报废数量。 */
    private BigDecimal qtyScrapped;

    /** 安全库存。 */
    private BigDecimal safetyStock;

    /** 库存状态：NORMAL/WARNING/SHORTAGE。 */
    private String stockStatus;

    private String remark;
}
