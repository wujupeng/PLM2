package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 办公用品库存台账变动（OA-DEV-081）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("oa_office_supply_txn")
public class OaOfficeSupplyTxn extends BaseEntity {

    /** 物品ID。 */
    private Long itemId;

    /** 物品编码。 */
    private String itemCode;

    /** 变动类型：ISSUE/INBOUND/ADJUST 等。 */
    private String txnType;

    /** 变动数量。 */
    private BigDecimal txnQty;

    /** 变动前数量。 */
    private BigDecimal beforeQty;

    /** 变动后数量。 */
    private BigDecimal afterQty;

    /** 来源单号。 */
    private String sourceNo;

    /** 操作人用户ID。 */
    private Long operatorUserId;

    /** 操作人姓名。 */
    private String operatorName;

    /** 变动时间。 */
    private LocalDateTime txnTime;

    /** 备注。 */
    private String remark;
}
