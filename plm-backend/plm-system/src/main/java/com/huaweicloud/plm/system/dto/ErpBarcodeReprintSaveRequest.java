package com.huaweicloud.plm.system.dto;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * 条码补打记录保存请求（对应 G3-N7a ERP 条码管理）。
 */
@Data
public class ErpBarcodeReprintSaveRequest {

    /** 补打单号（为空时自动生成）。 */
    private String reprintNo;

    /** 条码编号。 */
    private String barcodeNo;

    /** 补打原因。 */
    private String reprintReason;

    /** 补打次数，为空默认 1。 */
    private Integer reprintCount;

    /** 补打时间。 */
    private LocalDateTime reprintTime;

    /** 操作人姓名。 */
    private String operatorName;

    /** 审批状态，为空默认 NONE。 */
    private String approvalStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
