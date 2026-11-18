package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * 询价单保存请求（对应询价单）。
 */
@Data
public class SrmRfqSaveRequest {

    /** 询价单号（为空时自动生成）。 */
    private String rfqNo;

    /** 询价标题。 */
    @NotBlank(message = "询价标题不能为空")
    private String rfqTitle;

    /** 关联寻源单号。 */
    private String sourcingNo;

    /** 询价方式，为空默认 INVITED。 */
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

    /** 询价状态，为空默认 DRAFT。 */
    private String rfqStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
