package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 批次库存与物料标识（N7，DEV-075/079/081）：承载 FIFO 与超期判定的日期字段。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_material_batch")
public class WmsMaterialBatch extends BaseEntity {

    /** 批次号。 */
    private String batchNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 所在库位。 */
    private String locationCode;

    /** 容器编码/箱码。 */
    private String containerCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 在库数量。 */
    private BigDecimal qtyOnHand;

    /** 单位。 */
    private String unit;

    /** 入库日期（FIFO 依据）。 */
    private LocalDate inboundDate;

    /** 检验放行日期（FIFO 依据）。 */
    private LocalDate releaseDate;

    /** 批次生产日期（FIFO 依据）。 */
    private LocalDate productionDate;

    /** 有效期至。 */
    private LocalDate expiryDate;

    /** 检验状态：PENDING/RELEASED/REJECTED。 */
    private String inspectionStatus;

    /** 批次状态：IN_STOCK/CONSUMED/RETURNED/SCRAPPED/EXPIRED。 */
    private String batchStatus;

    /** 关联工单。 */
    private String workOrderNo;

    private String remark;
}
