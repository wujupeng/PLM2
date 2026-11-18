package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * ERP→MES 接收回执保存请求。
 */
@Data
public class IntgErpMesReceiptSaveRequest {

    /** 回执编号（为空时自动生成）。 */
    private String receiptNo;

    /** 批次号。 */
    private String batchNo;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，为空默认 PRODUCTION_ORDER。 */
    private String objectType;

    /** 对象编号。 */
    @NotBlank(message = "对象编号不能为空")
    private String objectNo;

    /** 对象版本。 */
    private String objectVersion;

    /** MES 对象标识。 */
    private String mesObjectId;

    /** 回执状态，为空默认 PENDING。 */
    private String receiptStatus;

    /** 校验信息。 */
    private String checkMessage;

    /** 回执时间。 */
    private LocalDateTime receiptTime;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
