package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ERP 委外管理—委外核销单（对应 WBS T024/T094 委外加工闭环，属 G3 ERP）：
 * 登记累计发料/到货/损耗/结存数量，支撑委外材料耗用对账与核销。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("erp_outsource_writeoff")
public class ErpOutsourceWriteoff extends BaseEntity {

    /** 核销单号（唯一，支持人工指定，为空时自动生成）。 */
    private String writeoffNo;

    /** 委外订单号。 */
    private String orderNo;

    /** 委外结算单号。 */
    private String settlementNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 累计发料数量，默认 0。 */
    private BigDecimal issuedQty;

    /** 累计到货数量，默认 0。 */
    private BigDecimal receivedQty;

    /** 损耗数量，默认 0。 */
    private BigDecimal lossQty;

    /** 结存数量，默认 0。 */
    private BigDecimal balanceQty;

    /** 核销日期。 */
    private LocalDateTime writeoffDate;

    /** 核销单状态，默认 OPEN。 */
    private String writeoffStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
