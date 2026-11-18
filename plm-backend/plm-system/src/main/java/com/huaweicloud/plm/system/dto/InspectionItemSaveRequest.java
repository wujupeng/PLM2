package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/**
 * 检验项目明细保存请求。
 */
@Data
public class InspectionItemSaveRequest {

    /** 序号，为空时按顺序自动生成。 */
    private Integer seqNo;

    /** 项目编码。 */
    private String itemCode;

    @NotBlank(message = "项目名称不能为空")
    private String itemName;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 检验设备。 */
    private String equipment;

    /** 单位。 */
    private String unit;

    /** 标准值。 */
    private String standardValue;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 判定规则。 */
    private String verdictRule;

    /** 是否关键项：0-否 1-是。 */
    private Integer keyItem;

    private String remark;
}
