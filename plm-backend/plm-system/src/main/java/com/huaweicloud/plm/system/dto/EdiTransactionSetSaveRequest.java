package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * EDI 交易集保存请求。
 */
@Data
public class EdiTransactionSetSaveRequest {

    /** 伙伴编码，* 表示通用。 */
    private String partnerCode;

    @NotBlank(message = "交易代码不能为空")
    private String transCode;

    /** 交易名称。 */
    private String transName;

    /** 方向：INBOUND/OUTBOUND。 */
    private String direction;

    /** 标准：X12/EDIFACT。 */
    private String standard;

    /** 标准版本。 */
    private String stdVersion;

    /** 报文头段标签。 */
    private String headerSegTag;

    /** 行段标签。 */
    private String lineSegTag;

    /** 回执交易代码。 */
    private String ackTransCode;

    /** 是否要求回执：1 是 / 0 否。 */
    private Integer ackRequired;

    /** 状态：enabled/disabled。 */
    private String status;

    /** 描述。 */
    private String description;

    private String remark;
}
