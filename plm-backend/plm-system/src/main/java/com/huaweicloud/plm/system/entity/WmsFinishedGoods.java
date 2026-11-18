package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 成品入库单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_finished_goods")
public class WmsFinishedGoods extends BaseEntity {

    /** 成品入库单号。 */
    private String fgNo;

    /** 入库类型，默认 FINISHED。 */
    private String fgType;

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

    /** 入库数量。 */
    private BigDecimal inboundQty;

    /** 包装号。 */
    private String packageNo;

    /** 包装类型。 */
    private String packageType;

    /** 标签号。 */
    private String labelNo;

    /** 入库状态，默认 DRAFT。 */
    private String fgStatus;

    /** 生产人。 */
    private String produceBy;

    /** 生产时间。 */
    private LocalDateTime produceTime;

    /** 入库人。 */
    private String inboundBy;

    /** 入库时间。 */
    private LocalDateTime inboundTime;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
