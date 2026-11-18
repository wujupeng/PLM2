package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 供应商确认与回执（N6，DEV-071）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_supplier_ack")
public class EdiSupplierAck extends BaseEntity {

    /** 回执编号（唯一）。 */
    private String ackNo;

    /** 分发主键。 */
    private Long dispatchId;

    /** 分发编号。 */
    private String dispatchNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 回执类型：CONFIRM/REJECT。 */
    private String ackType;

    /** 确认数量。 */
    private BigDecimal confirmedQty;

    /** 确认交期。 */
    private LocalDate confirmedDate;

    /** 缺口数量。 */
    private BigDecimal shortageQty;

    /** 缺口原因。 */
    private String shortageReason;

    /** 异常说明。 */
    private String exceptionText;

    /** 是否有差异：1 是 / 0 否。 */
    private Integer diffFlag;

    /** 来源：API/MAIL/EDI。 */
    private String source;

    /** 回执时间。 */
    private LocalDateTime ackAt;

    private String remark;
}
