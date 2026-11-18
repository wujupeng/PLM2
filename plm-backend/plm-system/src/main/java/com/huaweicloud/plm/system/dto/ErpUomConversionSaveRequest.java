package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import java.math.BigDecimal;
import lombok.Data;

/**
 * 计量单位换算保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpUomConversionSaveRequest {

    /** 换算编号（为空时自动生成）。 */
    private String conversionNo;

    /** 物料编码。 */
    private String materialCode;

    /** 源计量单位。 */
    @NotBlank(message = "源计量单位不能为空")
    private String fromUom;

    /** 目标计量单位。 */
    @NotBlank(message = "目标计量单位不能为空")
    private String toUom;

    /** 换算率，为空默认 1。 */
    private BigDecimal conversionRate;

    /** 换算状态，为空默认 ACTIVE。 */
    private String conversionStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
