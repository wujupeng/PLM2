package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.time.LocalDateTime;

/**
 * 序列号（库存控制）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("wms_serial_number")
public class WmsSerialNumber extends BaseEntity {

    /** 序列号（为空时自动生成）。 */
    private String serialNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 批次号。 */
    private String batchNo;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 库位编码。 */
    private String binCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 入库单号。 */
    private String receiptNo;

    /** 入库时间。 */
    private LocalDateTime inboundTime;

    /** 客户编码。 */
    private String customerCode;

    /** 出库时间。 */
    private LocalDateTime outboundTime;

    /** 序列号状态，默认 IN_STOCK。 */
    private String serialStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
