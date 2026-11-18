package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 检验规范保存请求。
 */
@Data
public class MesInspectionSpecSaveRequest {

    /** 规范编号（为空时自动生成）。 */
    private String specNo;

    /** 规范名称。 */
    @NotBlank(message = "规范名称不能为空")
    private String specName;

    /** 规范类型，为空默认 INCOMING。 */
    private String specType;

    /** 物料编码。 */
    private String materialCode;

    /** 物料名称。 */
    private String materialName;

    /** 工序编码。 */
    private String processCode;

    /** 检验项目。 */
    private String inspectionItem;

    /** 检验方法。 */
    private String inspectionMethod;

    /** 标准值。 */
    private String standardValue;

    /** 上限。 */
    private BigDecimal upperLimit;

    /** 下限。 */
    private BigDecimal lowerLimit;

    /** 抽样方案。 */
    private String samplePlan;

    /** AQL。 */
    private String aql;

    /** 规范版本。 */
    private String specVersion;

    /** 规范状态，为空默认 DRAFT。 */
    private String specStatus;

    /** 生效日期。 */
    private LocalDateTime effectiveDate;

    /** 失效日期。 */
    private LocalDateTime expireDate;

    /** 责任人。 */
    private String owner;

    /** 组织名称。 */
    private String orgName;

    /** 描述。 */
    private String description;

    /** 备注。 */
    private String remark;
}
