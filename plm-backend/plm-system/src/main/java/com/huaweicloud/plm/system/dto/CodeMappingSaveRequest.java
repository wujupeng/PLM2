package com.huaweicloud.plm.system.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 编码映射保存请求（N5）。
 */
@Data
public class CodeMappingSaveRequest {

    /** 原标签编码。 */
    @NotBlank(message = "原标签编码不能为空")
    private String sourceCode;

    /** 原码类型。 */
    private String sourceCodeType;

    /** 原码规则编码。 */
    private String sourceRuleCode;

    /** 追溯码。 */
    @NotBlank(message = "追溯码不能为空")
    private String targetCode;

    /** 追溯码类型。 */
    private String targetCodeType;

    /** 目标编码规则 ID。 */
    private Long ruleId;

    /** 目标编码规则编码。 */
    private String ruleCode;

    /** 产品编码。 */
    private String productCode;

    /** 物料编码。 */
    private String materialCode;

    /** 批次号。 */
    private String batchNo;

    /** 数量。 */
    private Integer qty;

    /** 工厂编码。 */
    private String plantCode;

    /** 客户编码。 */
    private String customerCode;

    /** 版本号。 */
    private String versionNo;

    /** 操作人 ID。 */
    private Long operatorId;

    /** 操作人名称。 */
    private String operatorName;

    /** 打印任务编号。 */
    private String printTaskNo;

    private String remark;
}
