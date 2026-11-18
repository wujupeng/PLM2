package com.huaweicloud.plm.system.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 检验规范保存请求。
 */
@Data
public class InspectionSpecSaveRequest {

    @NotBlank(message = "规范编码不能为空")
    private String specCode;

    @NotBlank(message = "规范名称不能为空")
    private String specName;

    /** 检验类型：iqc/ipqc/fqc/oqc。 */
    private String inspectionType;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 版本号，为空时默认 V1。 */
    private String versionNo;

    /** 抽样方案，为空时按配置兜底。 */
    private String samplingPlan;

    /** AQL 水平。 */
    private String aqlLevel;

    /** 状态，为空时默认 draft。 */
    private String status;

    /** 生效日期。 */
    private LocalDate effectiveDate;

    private String remark;

    /** 检验项目明细。 */
    @Valid
    private List<InspectionItemSaveRequest> items;
}
