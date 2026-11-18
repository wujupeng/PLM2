package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 计量单位业务档案保存请求（G3-N1 ERP 基础资料 WBS T021）。
 */
@Data
public class ErpUomSaveRequest {

    /** 计量单位档案编号（为空时自动生成）。 */
    private String uomNo;

    /** 计量单位编码。 */
    @NotBlank(message = "计量单位编码不能为空")
    private String uomCode;

    /** 计量单位名称。 */
    @NotBlank(message = "计量单位名称不能为空")
    private String uomName;

    /** 计量单位类型，为空默认 BASE。 */
    private String uomType;

    /** 小数精度位数，为空默认 0。 */
    private Integer precisionDigits;

    /** 计量单位状态，为空默认 ACTIVE。 */
    private String uomStatus;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
