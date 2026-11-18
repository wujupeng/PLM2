package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 工装寿命保存请求。
 */
@Data
public class MesToolLifeSaveRequest {

    /** 工装单号（为空时自动生成）。 */
    private String toolNo;

    /** 工装编码。 */
    @NotBlank(message = "工装编码不能为空")
    private String toolCode;

    /** 工装名称。 */
    private String toolName;

    /** 工装类型。 */
    private String toolType;

    /** 设备编码。 */
    private String equipmentCode;

    /** 总寿命。 */
    private BigDecimal totalLife;

    /** 已用寿命。 */
    private BigDecimal usedLife;

    /** 剩余寿命。 */
    private BigDecimal remainingLife;

    /** 寿命单位。 */
    private String lifeUnit;

    /** 寿命状态，为空默认 DRAFT。 */
    private String lifeStatus;

    /** 安装时间。 */
    private LocalDateTime installDate;

    /** 报废时间。 */
    private LocalDateTime scrappedDate;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
