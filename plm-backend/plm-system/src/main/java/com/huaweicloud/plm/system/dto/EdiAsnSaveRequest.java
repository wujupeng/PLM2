package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * ASN 保存请求。
 */
@Data
public class EdiAsnSaveRequest {

    /** ASN 编号，为空时自动生成。 */
    private String asnNo;

    /** 分发编号。 */
    private String dispatchNo;

    /** 需求编号。 */
    private String demandNo;

    /** 交易代码，缺省 856。 */
    private String transCode;

    /** ASN 类型，缺省 OUTBOUND。 */
    private String asnType;

    /** 客户编码。 */
    private String customerCode;

    /** 供应商编码。 */
    private String supplierCode;

    /** 收货地址。 */
    private String shipTo;

    /** 承运商。 */
    private String carrier;

    /** 运单号。 */
    private String trackingNo;

    /** 车牌号。 */
    private String plateNo;

    /** 发货日期。 */
    private LocalDate shipDate;

    /** 预计到达日期。 */
    private LocalDate etaDate;

    /** 箱数，为空时缺省取明细行数。 */
    private Integer packageCount;

    private String remark;

    /** 明细行。 */
    private List<EdiAsnLineSaveRequest> lines;
}
