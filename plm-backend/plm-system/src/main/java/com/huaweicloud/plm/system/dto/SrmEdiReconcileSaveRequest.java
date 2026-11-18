package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * EDI 对账保存请求（对应 EDI 对账）。
 */
@Data
public class SrmEdiReconcileSaveRequest {

    /** 对账单号（为空时自动生成）。 */
    private String reconcileNo;

    /** 合作方编码。 */
    @NotBlank(message = "合作方编码不能为空")
    private String partnerCode;

    /** 合作方名称。 */
    private String partnerName;

    /** 对账周期。 */
    private String reconcilePeriod;

    /** 报文类型，为空默认 ORDER。 */
    private String messageType;

    /** 发送笔数，为空默认 0。 */
    private Integer sendCount;

    /** 回执笔数，为空默认 0。 */
    private Integer ackCount;

    /** 失败笔数，为空默认 0。 */
    private Integer failCount;

    /** 对账结果。 */
    private String reconcileResult;

    /** 对账日期。 */
    private LocalDate reconcileDate;

    /** 对账状态，为空默认 PENDING。 */
    private String reconcileStatus;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
