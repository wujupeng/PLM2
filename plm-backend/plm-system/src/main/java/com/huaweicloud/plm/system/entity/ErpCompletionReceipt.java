package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 生产管理—完工入库单（对应 WBS T026 生产管理、T096 生产订单与补料，属 G3 ERP）：
 * 登记生产订单完工物料的完工数量、报废数量、入库仓库、报检与检验状态及入库状态。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_completion_receipt")
public class ErpCompletionReceipt extends BaseEntity {

    /** 完工入库单号（唯一，支持人工指定，为空时自动生成）。 */
    private String receiptNo;

    /** 生产订单号。 */
    private String orderNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 计量单位，默认 PCS。 */
    private String uom;

    /** 完工数量，默认 0。 */
    private BigDecimal completedQty;

    /** 报废数量，默认 0。 */
    private BigDecimal scrapQty;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 入库日期。 */
    private LocalDateTime receiptDate;

    /** 是否报检，默认 0。 */
    private Integer inspectionRequired;

    /** 检验状态，默认 PENDING。 */
    private String inspectionStatus;

    /** 入库状态，默认 DRAFT。 */
    private String receiptStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
