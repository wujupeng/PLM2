package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * SRM 对账保存请求。
 */
@Data
public class IntgErpSrmReconcileSaveRequest {

    /** 对账编号（为空时自动生成）。 */
    private String reconcileNo;

    /** 对账名称。 */
    @NotBlank(message = "对账名称不能为空")
    private String reconcileName;

    /** 接口编号。 */
    private String interfaceNo;

    /** 集成对象类型，为空默认 PURCHASE_REQUIREMENT。 */
    private String objectType;

    /** 源端数量，为空默认 0。 */
    private Integer sourceCount;

    /** 目标端数量，为空默认 0。 */
    private Integer targetCount;

    /** 差异数量，为空默认 0。 */
    private Integer diffCount;

    /** 对账日期。 */
    private LocalDateTime reconcileDate;

    /** 对账状态，为空默认 PENDING。 */
    private String reconcileStatus;

    /** 对账结果信息。 */
    private String resultMessage;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
