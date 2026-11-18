package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外入库单（对应 WBS T024 委外管理、T094 委外加工闭环，属 G3 ERP）：
 * 记录委外到货检验合格后的入库仓库、入库数量与批次，
 * 作为委外加工闭环中入库实绩登记与结算对账的依据。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_inbound")
public class ErpOutsourceInbound extends BaseEntity {

    /** 入库单号（唯一，支持人工指定，为空时自动生成）。 */
    private String inboundNo;

    /** 到货单号。 */
    private String receiptNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 仓库编码。 */
    private String warehouseCode;

    /** 入库日期。 */
    private LocalDateTime inboundDate;

    /** 入库数量，默认 0。 */
    private BigDecimal inboundQty;

    /** 批次号。 */
    private String batchNo;

    /** 操作人。 */
    private String operatorName;

    /** 入库单状态，默认 DRAFT。 */
    private String inboundStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
