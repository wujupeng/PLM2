package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * 需求向供应商分发（N6，DEV-070）。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("edi_demand_dispatch")
public class EdiDemandDispatch extends BaseEntity {

    /** 分发编号（唯一）。 */
    private String dispatchNo;

    /** 需求主键。 */
    private Long demandId;

    /** 需求编号。 */
    private String demandNo;

    /** 供应商编码。 */
    private String supplierCode;

    /** 供应商名称。 */
    private String supplierName;

    /** 物料编码。 */
    private String materialCode;

    /** 数量。 */
    private BigDecimal qty;

    /** 单位。 */
    private String unit;

    /** 需求交期。 */
    private LocalDate requiredDate;

    /** 需求版本号。 */
    private Integer demandVersion;

    /** 分配规则。 */
    private String allocationRule;

    /** 供货份额百分比。 */
    private BigDecimal sharePct;

    /** 发送渠道：API/MAIL/EDI。 */
    private String sendChannel;

    /** 发送状态：PENDING/SENT/FAILED。 */
    private String sendStatus;

    /** 重试次数。 */
    private Integer retryCount;

    /** 发送时间。 */
    private LocalDateTime sentAt;

    /** 回执时间。 */
    private LocalDateTime ackAt;

    /** 回执状态。 */
    private String ackStatus;

    /** 失败原因。 */
    private String failReason;

    private String remark;
}
