package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 条码管理—条码生成（对应 WBS G3-N7a ERP 条码管理）：
 * 登记条码号、条码类型、业务单号与物料/批次信息及打印状态，支撑物料条码的生成与打印。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_barcode")
public class ErpBarcode extends BaseEntity {

    /** 条码号（唯一，为空时自动生成）。 */
    private String barcodeNo;

    /** 条码类型，默认 MATERIAL。 */
    private String barcodeType;

    /** 业务单号。 */
    private String bizNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 批次号。 */
    private String batchNo;

    /** 数量，默认 0。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 编码规则编码。 */
    private String ruleCode;

    /** 标签模板编码。 */
    private String templateCode;

    /** 打印状态，默认 UNPRINTED。 */
    private String printStatus;

    /** 打印次数，默认 0。 */
    private Integer printCount;

    /** 打印时间。 */
    private LocalDateTime printTime;

    /** 打印机。 */
    private String printer;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
