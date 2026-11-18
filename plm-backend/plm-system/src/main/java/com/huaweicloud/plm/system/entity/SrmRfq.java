package com.huaweicloud.plm.system.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.huaweicloud.plm.common.persistence.BaseEntity;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * SRM 寻源与询报价—询价单（对应询价单）：
 * 登记询价单号、询价标题、关联寻源单、询价方式、物料信息与数量、报价截止日期、
 * 邀请与已报价供应商数、采购员与询价状态，支撑询报价追溯。
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("srm_rfq")
public class SrmRfq extends BaseEntity {

    /** 询价单号（唯一，为空时自动生成）。 */
    private String rfqNo;

    /** 询价标题。 */
    private String rfqTitle;

    /** 关联寻源单号。 */
    private String sourcingNo;

    /** 询价方式，默认 INVITED。 */
    private String rfqType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 规格型号。 */
    private String spec;

    /** 询价数量。 */
    private BigDecimal rfqQty;

    /** 单位。 */
    private String unit;

    /** 发布日期。 */
    private LocalDate publishDate;

    /** 报价截止日期。 */
    private LocalDate deadlineDate;

    /** 邀请供应商数。 */
    private Integer inviteCount;

    /** 已报价数。 */
    private Integer quoteCount;

    /** 采购员。 */
    private String buyer;

    /** 询价状态，默认 DRAFT。 */
    private String rfqStatus;

    /** 组织ID。 */
    private Long orgId;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
