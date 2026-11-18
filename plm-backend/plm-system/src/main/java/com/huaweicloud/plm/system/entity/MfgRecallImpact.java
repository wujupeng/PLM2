package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;

/**
 * 召回影响清单（N8，DEV-094）：受影响产品、库存、工单与客户清单。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("mfg_recall_impact")
public class MfgRecallImpact extends BaseEntity {

    /** 召回单号。 */
    private String recallNo;

    /** 影响类型：PRODUCT/STOCK/WORK_ORDER/CUSTOMER。 */
    private String impactType;

    /** 影响对象单号（产品码/库存批次/工单号/客户订单）。 */
    private String impactRefNo;

    /** 产品编码。 */
    private String productCode;

    /** 生产批次号。 */
    private String batchNo;

    /** 物料编码。 */
    private String materialCode;

    /** 物料批次号。 */
    private String materialBatchNo;

    /** 客户编码。 */
    private String customerCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 影响状态：IDENTIFIED/ISOLATED/RELEASED/CLOSED。 */
    private String impactStatus;

    private String remark;
}
