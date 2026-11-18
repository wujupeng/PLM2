package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

/**
 * 环保合规记录保存请求。
 */
@Data
public class SpecComplianceSaveRequest {

    @NotBlank(message = "合规记录编码不能为空")
    private String complianceCode;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 合规要求类型。 */
    private String requirementType;

    /** 风险等级。 */
    private String riskLevel;

    /** 供应商编码。 */
    private String supplierCode;

    /** 声明编号。 */
    private String declarationNo;

    /** 声明文件。 */
    private String declarationFile;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    /** 失效日期。 */
    private LocalDate expireDate;

    /** 状态。 */
    private String status;

    private String remark;
}
